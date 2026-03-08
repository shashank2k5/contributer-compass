"use client";

import { useState } from "react";
import { GitHubFile } from "@/lib/github";
import { FileScore } from "@/lib/scorer";

export interface AnalyzedFile extends GitHubFile, FileScore {
    dependencies: string[];
}

export function FileTree({ files }: { files: AnalyzedFile[] }) {
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([""]));

    const toggleDir = (path: string) => {
        setExpandedDirs((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    // Group files by directory
    const rootDir: any = { name: "root", path: "", directories: {}, files: [] };

    files.forEach((file) => {
        const parts = file.path.split("/");
        const fileName = parts.pop() || "";
        let currentDir = rootDir;

        parts.forEach((part, i) => {
            const dirPath = parts.slice(0, i + 1).join("/");
            if (!currentDir.directories[part]) {
                currentDir.directories[part] = {
                    name: part,
                    path: dirPath,
                    directories: {},
                    files: [],
                };
            }
            currentDir = currentDir.directories[part];
        });

        currentDir.files.push(file);
    });

    const renderNode = (node: any, depth = 0) => {
        const isExpanded = expandedDirs.has(node.path);

        return (
            <div key={node.path || "root"} className="w-full font-mono text-sm">
                {/* Render Directory */}
                {node.path !== "" && (
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-gray-300"
                        style={{ paddingLeft: `${depth * 16}px` }}
                        onClick={() => toggleDir(node.path)}
                    >
                        <span className="text-gray-500 w-4">{isExpanded ? "▾" : "▸"}</span>
                        <span>📁</span>
                        <span className="truncate">{node.name}</span>
                    </div>
                )}

                {/* Render Children if expanded (or if root) */}
                {(isExpanded || node.path === "") && (
                    <div>
                        {Object.values(node.directories).map((dir: any) =>
                            renderNode(dir, depth + 1)
                        )}
                        {node.files.map((file: AnalyzedFile) => {
                            const colorMap = {
                                green: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
                                yellow: "text-amber-400 border-amber-400/30 bg-amber-400/10",
                                red: "text-red-400 border-red-400/30 bg-red-400/10",
                            };
                            const dotMap = { green: "🟢", yellow: "🟡", red: "🔴" };

                            return (
                                <div
                                    key={file.path}
                                    className={`flex items-center gap-3 px-3 py-1.5 hover:bg-white/5 cursor-default border-l-2 transition-colors ${colorMap[file.color] || colorMap.red
                                        }`}
                                    style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
                                    title={`${file.label} (Score: ${file.score})`}
                                >
                                    <span className="text-xs shrink-0">{dotMap[file.color || "red"]}</span>
                                    <span className="truncate flex-1">{file.name}</span>
                                    <div className="flex gap-2 shrink-0">
                                        <span className="text-xs opacity-60 text-right w-12 hidden sm:block">
                                            {file.dependencies?.length || 0} deps
                                        </span>
                                        <span className="text-xs font-bold opacity-80 w-8 text-right">
                                            {file.score}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (!files || files.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No code files analyzed yet. Enter a GitHub URL to start.
            </div>
        );
    }

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md">
            <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-white">Repository Files</h3>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="text-[10px]">🟢</span> Beginner</span>
                    <span className="flex items-center gap-1"><span className="text-[10px]">🟡</span> Intermediate</span>
                    <span className="flex items-center gap-1"><span className="text-[10px]">🔴</span> Advanced</span>
                </div>
            </div>
            <div className="overflow-y-auto max-h-[600px] py-2">
                {renderNode(rootDir)}
            </div>
        </div>
    );
}
