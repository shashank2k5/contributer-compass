import { Octokit } from "octokit";

export interface GitHubFile {
    path: string;
    mode: string;
    type: "blob" | "tree" | "commit";
    sha: string;
    size?: number;
    url: string;
    depth: number;
    name: string;
}

/**
 * Get the full recursive file tree for a repository
 */
export async function getRepoTree(
    token: string,
    owner: string,
    repo: string,
    branch = "HEAD"
): Promise<GitHubFile[]> {
    const octokit = new Octokit({ auth: token });

    try {
        const { data } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: branch,
            recursive: "true",
        });

        return (data.tree as GitHubFile[])
            .map((item) => ({
                ...item,
                depth: item.path.split("/").length - 1,
                name: item.path.split("/").pop() || item.path,
            }))
            .filter((item) => !item.path.includes("node_modules") && !item.path.includes(".git"));
    } catch (error) {
        console.error(`Failed to fetch repo tree for ${owner}/${repo}:`, error);
        throw new Error("Failed to fetch repository tree. Ensure the URL is correct and you have access.");
    }
}

/**
 * Fetch the contents of a specific file
 */
export async function getFileContent(
    token: string,
    owner: string,
    repo: string,
    path: string
): Promise<string> {
    const octokit = new Octokit({ auth: token });

    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if ("content" in data) {
            return Buffer.from(data.content, "base64").toString("utf-8");
        }
        throw new Error("Target path is not a file");
    } catch (error) {
        console.error(`Failed to fetch file content for ${path}:`, error);
        throw new Error(`Failed to fetch content for ${path}`);
    }
}

/**
 * Checks if a given file path is a code file that should be analyzed
 */
export function isCodeFile(path: string): boolean {
    const codeExtensions = [".js", ".jsx", ".ts", ".tsx", ".py", ".rb", ".go", ".java", ".c", ".cpp", ".cs", ".php", ".rs"];
    const fileName = path.split("/").pop() || "";

    // Skip minified and configuration files
    if (
        fileName.includes(".min.") ||
        fileName === "package-lock.json" ||
        fileName === "yarn.lock" ||
        fileName === "pnpm-lock.yaml"
    ) {
        return false;
    }

    return codeExtensions.some((ext) => path.endsWith(ext));
}

/**
 * Parse a GitHub URL to extract owner and repo
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } {
    try {
        // Remove trailing slashes and .git
        let cleanUrl = url.trim().replace(/\/$/, "").replace(/\.git$/, "");

        // Check if it's already in owner/repo format
        if (!cleanUrl.includes("github.com")) {
            const parts = cleanUrl.split("/");
            if (parts.length === 2) {
                return { owner: parts[0], repo: parts[1] };
            }
        }

        const parsed = new URL(cleanUrl);
        if (parsed.hostname !== "github.com") {
            throw new Error("Not a GitHub URL");
        }

        const pathParts = parsed.pathname.split("/").filter(Boolean);
        if (pathParts.length < 2) {
            throw new Error("Invalid GitHub URL format");
        }

        return {
            owner: pathParts[0],
            repo: pathParts[1],
        };
    } catch (error) {
        throw new Error("Invalid GitHub repository URL");
    }
}
