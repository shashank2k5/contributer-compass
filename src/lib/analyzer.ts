import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

export interface FileAnalysis {
    complexity: number;
    dependencies: string[];
}

/**
 * Analyzes code using an Abstract Syntax Tree (AST)
 * Returns cyclomatic complexity and a list of dependencies (imports)
 */
export function analyzeFile(code: string, filename: string): FileAnalysis {
    let complexity = 1; // Base complexity is 1
    const dependencies: Set<string> = new Set();

    try {
        // Determine plugins based on extension
        const plugins: any[] = ["jsx"];
        if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
            plugins.push("typescript");
        }

        // Parse code into an AST
        const ast = parse(code, {
            sourceType: "module",
            plugins,
            errorRecovery: true, // Don't fail completely on syntax errors
        });

        // Traverse the AST to compute metrics
        traverse(ast, {
            // 1. Cyclomatic Complexity Counters
            IfStatement: () => {
                complexity++;
            },
            ForStatement: () => {
                complexity++;
            },
            ForInStatement: () => {
                complexity++;
            },
            ForOfStatement: () => {
                complexity++;
            },
            WhileStatement: () => {
                complexity++;
            },
            DoWhileStatement: () => {
                complexity++;
            },
            ConditionalExpression: () => {
                complexity++; // Ternary operators
            },
            LogicalExpression: (path) => {
                // && and || add to complexity
                if (path.node.operator === "&&" || path.node.operator === "||") {
                    complexity++;
                }
            },
            SwitchCase: (path) => {
                // Each case (except default) adds to complexity
                if (path.node.test !== null) {
                    complexity++;
                }
            },
            CatchClause: () => {
                complexity++;
            },

            // 2. Dependency Tracking
            ImportDeclaration: (path) => {
                dependencies.add(path.node.source.value);
            },
            CallExpression: (path) => {
                // Catch dynamic imports: import('...') or require('...')
                if (
                    path.node.callee.type === "Identifier" &&
                    path.node.callee.name === "require" &&
                    path.node.arguments[0] &&
                    path.node.arguments[0].type === "StringLiteral"
                ) {
                    dependencies.add(path.node.arguments[0].value);
                } else if (
                    path.node.callee.type === "Import" &&
                    path.node.arguments[0] &&
                    path.node.arguments[0].type === "StringLiteral"
                ) {
                    dependencies.add(path.node.arguments[0].value);
                }
            },
        });

        return {
            complexity,
            dependencies: Array.from(dependencies),
        };
    } catch (error) {
        // Fallback: if AST parsing fails, return a fast naive estimate
        console.warn(`AST parsing failed for ${filename}, falling back to Regex estimation.`);
        return naiveAnalysis(code);
    }
}

/**
 * Fallback regex-based analyzer if Babel parsing fails (e.g. invalid syntax)
 */
function naiveAnalysis(code: string): FileAnalysis {
    // Very rough estimate of complexity using regex
    const branchKeywords = /\b(if|for|while|case|catch)\b/g;
    const match = code.match(branchKeywords);
    const complexity = 1 + (match ? match.length : 0);

    // Rough estimate of imports
    const dependencies = new Set<string>();
    const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
    let importMatch;
    while ((importMatch = importRegex.exec(code)) !== null) {
        dependencies.add(importMatch[1]);
    }

    return {
        complexity,
        dependencies: Array.from(dependencies),
    };
}
