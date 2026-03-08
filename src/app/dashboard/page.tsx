"use client";

import { useState } from "react";
import { FileTree } from "@/components/FileTree";
import { DependencyGraph } from "@/components/DependencyGraph";
import { Chat } from "@/components/Chat";
import { ChallengeCards } from "@/components/ChallengeCards";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
    const [repoUrl, setRepoUrl] = useState("");
    const [activeTab, setActiveTab] = useState<"tree" | "graph" | "chat" | "challenges">("tree");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState("");
    const { data: session } = useSession();

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setIsAnalyzing(true);
        setError("");

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to analyze repository");
            }

            const data = await res.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRepoContext = () => {
        if (!analysis) return "";
        return `We analyzed ${analysis.fileScores.length} files. 
    The file tree looks like this: ${JSON.stringify(
            analysis.fileScores.map((f: any) => ({
                path: f.path,
                score: f.score,
                tier: f.label
            }))
        )}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans">
            {/* Top Navbar */}
            <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-white">
                        RG
                    </div>
                    <span className="font-semibold text-lg tracking-tight">RepoGuide</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">Welcome, {session?.user?.name || "Developer"}</div>
                    {session?.user?.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20"></div>
                    )}
                </div>
            </nav>

            <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">

                {/* Repo Input Bar */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleAnalyze} className="flex gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/facebook/react"
                                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAnalyzing || !repoUrl}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Repo"
                            )}
                        </button>
                    </form>
                    {error && <div className="mt-3 text-red-400 text-sm pl-2">{error}</div>}
                </div>

                {/* Dashboard Content Container */}
                {analysis ? (
                    <div className="flex-1 flex flex-col min-h-[600px] border border-white/10 rounded-2xl overflow-hidden bg-black/20 shadow-xl">
                        {/* Context/Stats Header */}
                        <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex gap-8">
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Repository</div>
                                <div className="text-lg font-bold text-white flex items-center gap-2">
                                    {analysis.owner}/{analysis.repo}
                                    <a href={analysis.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                                            <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Code Files</div>
                                <div className="text-lg font-bold text-white">{analysis.fileScores.length}</div>
                            </div>
                            <div className="w-px bg-white/10"></div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Beginner Friendly</div>
                                <div className="text-lg font-bold text-emerald-400">
                                    {analysis.fileScores.filter((f: any) => f.color === "green").length}
                                </div>
                            </div>
                        </div>

                        {/* Main Tabs */}
                        <div className="flex border-b border-white/10 bg-black/40 px-4">
                            {[
                                { id: "tree", label: "File Explorer", icon: "📁" },
                                { id: "graph", label: "Dependency Graph", icon: "🕸️" },
                                { id: "chat", label: "AI Assistant", icon: "✨" },
                                { id: "challenges", label: "PR Challenges", icon: "🎯" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-all font-medium text-sm ${activeTab === tab.id
                                        ? "border-cyan-400 text-cyan-400 bg-cyan-400/5"
                                        : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Viewport */}
                        <div className="flex-1 bg-black/50 p-6 overflow-hidden relative">
                            {activeTab === "tree" && (
                                <div className="h-full max-w-4xl mx-auto flex flex-col">
                                    <h2 className="text-xl font-semibold mb-4 text-white">Project Structure</h2>
                                    <p className="text-gray-400 text-sm mb-6">Files are color-coded based on their underlying complexity, dependencies, and test coverage. This helps identify where a new contributor should start.</p>
                                    <div className="flex-1 overflow-hidden">
                                        <FileTree files={analysis.fileScores} />
                                    </div>
                                </div>
                            )}

                            {activeTab === "graph" && (
                                <div className="absolute inset-0">
                                    <DependencyGraph initialNodes={analysis.graph.nodes} initialEdges={analysis.graph.edges} />
                                </div>
                            )}

                            {activeTab === "chat" && (
                                <div className="h-full max-w-3xl mx-auto flex flex-col">
                                    <Chat owner={analysis.owner} repo={analysis.repo} repoContext={getRepoContext()} />
                                </div>
                            )}

                            {activeTab === "challenges" && (
                                <div className="h-full max-w-4xl mx-auto flex flex-col pt-4">
                                    <h2 className="text-xl font-semibold mb-2 text-white">Your First Pull Request</h2>
                                    <p className="text-gray-400 text-sm mb-6">Get AI-generated actionable challenges based on the files with the lowest complexity in this repository.</p>
                                    <div className="flex-1 overflow-hidden">
                                        <ChallengeCards owner={analysis.owner} repo={analysis.repo} fileScores={analysis.fileScores} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 flex items-center justify-center border border-white/5">
                            <span className="text-4xl">🚀</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Initialize Your Journey</h2>
                        <p className="text-gray-400 max-w-md">
                            Paste any public GitHub repository URL above to generate a topological map, complexity scores, and an AI guide for the codebase.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
