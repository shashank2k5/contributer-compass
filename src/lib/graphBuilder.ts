import { FileScore } from "./scorer";
import { GitHubFile } from "./github";

export interface AnalyzedFile extends GitHubFile, FileScore {
    dependencies: string[];
}

export interface GraphNode {
    id: string;
    position: { x: number; y: number };
    data: {
        label: string;
        path: string;
        color: "green" | "yellow" | "red";
        score: number;
        size: number;
    };
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

/**
 * Builds nodes and edges for React Flow out of the analyzed files
 */
export function buildGraph(files: AnalyzedFile[]): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Create lookup for fast resolution
    const filePaths = new Set(files.map((f) => f.path));

    files.forEach((file, i) => {
        // 1. Create a Node
        // Simple initial algorithmic grid layout
        const x = (i % 8) * 180;
        const y = Math.floor(i / 8) * 120;

        nodes.push({
            id: file.path,
            position: { x, y },
            data: {
                label: file.name,
                path: file.path,
                color: file.color,
                score: file.score,
                size: file.size || 0,
            },
        });

        // 2. Create Edges based on dependencies
        file.dependencies.forEach((dep) => {
            const resolvedTarget = resolveImport(dep, file.path, filePaths);

            if (resolvedTarget) {
                // Prevent strictly identical source/target loops
                if (file.path !== resolvedTarget) {
                    edges.push({
                        id: `${file.path}-to-${resolvedTarget}`,
                        source: file.path,
                        target: resolvedTarget,
                        animated: true, // Cool effect for dependencies
                    });
                }
            }
        });
    });

    return { nodes, edges };
}

/**
 * Attempts to resolve a JS/TS import path (e.g. "../components/Button") 
 * to an actual absolute file path in the repo (e.g. "src/components/Button.tsx")
 */
function resolveImport(
    importPath: string,
    sourcePath: string,
    repoFiles: Set<string>
): string | null {
    // If it's a 3rd party package (doesn't start with . or /)
    // we ignore it for the internal dependency graph
    if (!importPath.startsWith(".") && !importPath.startsWith("/")) {

        // Check TS alias resolution roughly (e.g. "@/components/Button")
        if (importPath.startsWith("@/")) {
            importPath = importPath.replace("@/", "src/");
        } else if (importPath.startsWith("~")) {
            importPath = importPath.replace("~", "src/");
        } else {
            return null;
        }
    }

    // Calculate base directory of source file
    const sourceParts = sourcePath.split("/");
    sourceParts.pop(); // Remove the filename itself
    const sourceDir = sourceParts.join("/");

    // Resolve relative path
    let targetPath = importPath;
    if (importPath.startsWith(".")) {
        const importParts = importPath.split("/");
        const resolvedParts = [...sourceParts];

        for (const part of importParts) {
            if (part === ".") continue;
            if (part === "..") {
                resolvedParts.pop();
            } else {
                resolvedParts.push(part);
            }
        }
        targetPath = resolvedParts.join("/");
    } else if (importPath.startsWith("/")) {
        // Treat absolute imports as starting from root
        targetPath = importPath.substring(1);
    }

    // Extensions to check if the import omits the extension
    const extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];

    for (const ext of extensions) {
        const trialPath = targetPath + ext;
        if (repoFiles.has(trialPath)) {
            return trialPath;
        }
    }

    return null;
}
