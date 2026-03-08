import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import OpenAI from "openai";

// Use the same minimal OpenRouter-backed OpenAI client config as the working test script.
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
console.log(
    "[challenges] OPENROUTER_API_KEY prefix:",
    openRouterApiKey?.slice(0, 10),
    "length:",
    openRouterApiKey?.length ?? "undefined"
);

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: openRouterApiKey,
});

// Expected JSON structure from Claude/OpenAI
export interface PRChallenge {
    title: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    description: string;
    file: string;
    lineRange: string;
    pattern: string;
    testRequirements: string;
    // Some models may return this as a single string or an array of strings.
    acceptanceCriteria: string | string[];
    estimatedHours: number;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!openRouterApiKey) {
            return NextResponse.json(
                { error: "Server misconfigured: OPENROUTER_API_KEY is not set." },
                { status: 500 }
            );
        }

        const { fileScores, skillLevel = "Beginner", owner, repo } = await req.json();

        if (!fileScores || !owner || !repo) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Isolate the easiest files for challenges
        const targetColor = skillLevel === "Beginner" ? "green" : skillLevel === "Intermediate" ? "yellow" : "red";
        const candidateFiles = fileScores
            .filter((f: any) => f.color === targetColor)
            .slice(0, 10); // Pick top 10 to give AI options

        if (candidateFiles.length === 0) {
            return NextResponse.json(
                { error: `No ${skillLevel} friendly files found to generate challenges.` },
                { status: 404 }
            );
        }

        const systemPrompt = `You are a Senior Engineering Manager generating onboarding Pull Request challenges for developers joining a new repository.
You must output a JSON object containing a "challenges" array. Return pure JSON.`;

        const userPrompt = `
Repository: ${owner}/${repo}
Target Skill Level: ${skillLevel}

Here is a list of candidate files that are appropriate for this skill level based on their complexity, size, and dependencies:
${JSON.stringify(
            candidateFiles.map((f: any) => ({
                name: f.name,
                path: f.path,
                size: f.size,
                complexity: f.score,
            })),
            null,
            2
        )}

Generate exactly 3 diverse PR challenges that a developer could reasonably complete to learn the codebase.
The challenges should range from simple refactors to adding tests or minor features.

Return a JSON object with a single "challenges" key containing an array of objects with exactly this structure:
{
  "challenges": [
    {
      "title": "Clear, actionable title",
      "difficulty": "${skillLevel}",
      "description": "2-3 sentences explaining the 'why' and 'what' of the change.",
      "file": "exact/path/to/file.ts",
      "lineRange": "approximate lines, e.g. 50-75 or 'entire file'",
      "pattern": "Core concept being tested (e.g. 'React Hooks', 'Error Handling')",
      "testRequirements": "What tests need to be added/updated",
      "acceptanceCriteria": "Bullet point list of criteria to consider this PR merged",
      "estimatedHours": 2
    }
  ]
}
    `;

        // Call OpenRouter via the OpenAI client (same pattern as chat route)
        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.4,
            response_format: { type: "json_object" },
        });

        const responseContent = response.choices[0]?.message?.content || "{}";

        let challenges: PRChallenge[] = [];
        try {
            const parsed = JSON.parse(responseContent);
            challenges = parsed.challenges || [];
        } catch (parseError) {
            console.error("Failed to parse OpenAI JSON response:", responseContent);
            return NextResponse.json(
                { error: "Failed to generate structured challenges" },
                { status: 500 }
            );
        }

        return NextResponse.json({ challenges });
    } catch (error: any) {
        console.error("Challenges API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate challenges" },
            { status: 500 }
        );
    }
}
