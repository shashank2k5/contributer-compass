"use client";

import { useState } from "react";
import { PRChallenge } from "@/app/api/challenges/route";

interface ChallengeCardsProps {
    owner: string;
    repo: string;
    fileScores: any[];
}

export function ChallengeCards({ owner, repo, fileScores }: ChallengeCardsProps) {
    const [challenges, setChallenges] = useState<PRChallenge[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [skillLevel, setSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
    const [error, setError] = useState("");

    const generateChallenges = async () => {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner, repo, fileScores, skillLevel }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to generate challenges");
            }

            const data = await res.json();
            setChallenges(data.challenges);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const difficultyColors = {
        Beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
            <div className="px-5 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">PR Challenges</h3>
                <div className="flex gap-2">
                    <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value as any)}
                        className="bg-black/50 border border-white/10 rounded-lg px-2 text-sm text-gray-300 focus:outline-none"
                    >
                        <option value="Beginner">Beginner 🟢</option>
                        <option value="Intermediate">Intermediate 🟡</option>
                        <option value="Advanced">Advanced 🔴</option>
                    </select>
                    <button
                        onClick={generateChallenges}
                        disabled={isLoading || fileScores.length === 0}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                Generating...
                            </>
                        ) : (
                            "Generate"
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {error && (
                    <div className="p-4 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {challenges.length === 0 && !isLoading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                        <div className="text-4xl">🎯</div>
                        <div className="max-w-[250px] text-gray-400 text-sm">
                            Generate AI-powered challenges to help you learn this codebase by contributing.
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {challenges.map((challenge, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-medium">{challenge.title}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${difficultyColors[challenge.difficulty]}`}>
                                    {challenge.difficulty}
                                </span>
                            </div>

                            <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-black/50 rounded-lg p-3 border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1 font-mono uppercase">Target File</div>
                                    <div className="text-sm text-cyan-400 font-mono truncate" title={challenge.file}>
                                        <a href={`https://github.com/${owner}/${repo}/blob/main/${challenge.file}`} target="_blank" rel="noreferrer" className="hover:underline">
                                            {challenge.file.split("/").pop()}
                                        </a>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Lines: {challenge.lineRange}</div>
                                </div>

                                <div className="bg-black/50 rounded-lg p-3 border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1 font-mono uppercase">Metadata</div>
                                    <div className="text-sm text-white truncate">{challenge.pattern}</div>
                                    <div className="text-xs text-gray-500 mt-1">Est: {challenge.estimatedHours} hours</div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 mb-2 font-mono uppercase">Acceptance Criteria</div>
                                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                    {(
                                        Array.isArray(challenge.acceptanceCriteria)
                                            ? challenge.acceptanceCriteria
                                            : typeof challenge.acceptanceCriteria === "string"
                                                ? challenge.acceptanceCriteria.split("\n")
                                                : []
                                    ).map((criterion, i) => (
                                        <li key={i}>{String(criterion).replace(/^- /, "")}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
