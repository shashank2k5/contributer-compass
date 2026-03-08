import { GitHubFile } from "./github";
import { FileAnalysis } from "./analyzer";

export interface FileScore {
    score: number;
    color: "green" | "yellow" | "red";
    label: "Beginner" | "Intermediate" | "Advanced";
}

/**
 * Calculates a composite score (0-100) for how beginner-friendly a file is.
 * Green (>70) = Beginner friendly
 * Yellow (40-70) = Intermediate
 * Red (<40) = Advanced / Complex
 */
export function scoreFile(
    file: GitHubFile,
    analysis: FileAnalysis,
    hasTestFile: boolean
): FileScore {
    // Score 1: Cyclomatic Complexity (30% weight)
    // Lower complexity = higher score
    const complexityScore = mapComplexity(analysis.complexity);

    // Score 2: Test Coverage indicator (25% weight)
    // Having a test file implies the file is documented via tests
    const testScore = hasTestFile ? 100 : 0;

    // Score 3: Dependencies (25% weight)
    // Fewer dependencies = easier to understand = higher score
    const depsScore = mapDependencies(analysis.dependencies.length);

    // Score 4: File Size (20% weight)
    // Smaller files = easier to read
    const sizeScore = mapFileSize(file.size || 0);

    // Calculate weighted total
    const total =
        complexityScore * 0.3 +
        testScore * 0.25 +
        depsScore * 0.25 +
        sizeScore * 0.2;

    // Round to nearest integer
    const score = Math.round(total);

    let color: "green" | "yellow" | "red" = "red";
    let label: "Beginner" | "Intermediate" | "Advanced" = "Advanced";

    if (score >= 70) {
        color = "green";
        label = "Beginner";
    } else if (score >= 40) {
        color = "yellow";
        label = "Intermediate";
    }

    return {
        score,
        color,
        label,
    };
}

// --- Helper mapping functions ---

/**
 * Maps cyclomatic complexity to a 0-100 score.
 * Complexity 1-3 is great. Over 15 is highly complex.
 */
function mapComplexity(c: number): number {
    if (c <= 3) return 100;
    if (c <= 5) return 80;
    if (c <= 10) return 50;
    if (c <= 15) return 20;
    return 0;
}

/**
 * Maps dependency count to a 0-100 score.
 * 0-2 imports is easy. > 10 is heavily coupled.
 */
function mapDependencies(d: number): number {
    if (d <= 2) return 100;
    if (d <= 5) return 70;
    if (d <= 10) return 40;
    return 10;
}

/**
 * Maps file size bytes to a 0-100 score.
 * Assuming less than ~2KB (approx 50-100 lines) is very readable.
 */
function mapFileSize(bytes: number): number {
    if (bytes < 1000) return 100; // < 1KB
    if (bytes < 3000) return 80;  // < 3KB
    if (bytes < 10000) return 40; // < 10KB
    if (bytes < 30000) return 10; // < 30KB
    return 0;
}
