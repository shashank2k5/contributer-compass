import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { getRepoTree, getFileContent, isCodeFile, parseRepoUrl } from "@/lib/github";
import { analyzeFile } from "@/lib/analyzer";
import { scoreFile } from "@/lib/scorer";
import { buildGraph } from "@/lib/graphBuilder";
import { cache } from "@/lib/redis";
import pLimit from "p-limit";

const prisma = new PrismaClient();
// Limit concurrent GitHub API requests to avoid rate limits
const limit = pLimit(10);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in with GitHub." },
                { status: 401 }
            );
        }

        const { repoUrl, branch = "main" } = await req.json();
        if (!repoUrl) {
            return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
        }

        const { owner, repo } = parseRepoUrl(repoUrl);
        const cacheKey = `analysis:${owner}/${repo}:${branch}`;

        // 1. Check Cache
        const cached = await cache.get(cacheKey);
        if (cached) {
            console.log(`Cache hit for ${owner}/${repo}`);
            return NextResponse.json(JSON.parse(cached));
        }

        console.log(`Starting analysis for ${owner}/${repo}`);

        // 2. Fetch Repository Tree
        const tree = await getRepoTree(session.accessToken as string, owner, repo, branch);

        // Filter down to just the code files (limit to top 150 for speed/cost)
        const codeFiles = tree
            .filter((f) => f.type === "blob" && isCodeFile(f.path))
            .slice(0, 150);

        console.log(`Found ${codeFiles.length} code files to analyze out of ${tree.length} total files.`);

        // 3. Analyze Each File Concurrently using p-limit
        const fileScores = await Promise.all(
            codeFiles.map((file) =>
                limit(async () => {
                    try {
                        const content = await getFileContent(
                            session.accessToken as string,
                            owner,
                            repo,
                            file.path
                        );

                        const analysis = analyzeFile(content, file.path);

                        // Check if there's a corresponding test file
                        const hasTest = tree.some((t) => {
                            const baseName = file.name.split(".")[0];
                            return (
                                t.path.includes(baseName) &&
                                (t.path.includes("test") || t.path.includes("spec"))
                            );
                        });

                        const score = scoreFile(file, analysis, hasTest);

                        return {
                            ...file,
                            ...score,
                            dependencies: analysis.dependencies,
                        };
                    } catch (error) {
                        console.error(`Failed to analyze ${file.path}:`, error);
                        // Return a safe default if analysis fails
                        return {
                            ...file,
                            score: 0,
                            color: "red" as const,
                            label: "Advanced" as const,
                            dependencies: [],
                        };
                    }
                })
            )
        );

        // 4. Build Dependency Graph
        const graph = buildGraph(fileScores);

        const result = {
            repoUrl,
            owner,
            repo,
            fileScores,
            graph,
        };

        // 5. Store in Database & Cache
        try {
            await prisma.analysis.create({
                data: {
                    repoUrl,
                    userId: session.user.id,
                    fileTree: fileScores as any,
                    depGraph: graph as any,
                },
            });
            console.log(`Saved analysis to database for ${owner}/${repo}`);
        } catch (dbError) {
            console.error("Failed to save to database:", dbError);
            // We don't fail the request if DB save fails
        }

        // Cache for 1 hour
        await cache.set(cacheKey, JSON.stringify(result), 3600);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze repository" },
            { status: 500 }
        );
    }
}
