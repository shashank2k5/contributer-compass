"use client";

import { useMemo, useCallback } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionLineType,
    BackgroundVariant,
    Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Node styling configuration
const nodeColors = {
    green: "#10b981", // emerald-500
    yellow: "#f59e0b", // amber-500
    red: "#ef4444", // red-500
};

export function DependencyGraph({ initialNodes = [], initialEdges = [] }: any) {
    // Add styling to nodes based on their properties
    const styledNodes = useMemo(
        () =>
            initialNodes.map((n: any) => ({
                ...n,
                // Override default handles
                sourcePosition: "right",
                targetPosition: "left",
                style: {
                    background: "#111827", // gray-900
                    border: `1.5px solid ${nodeColors[n.data.color as keyof typeof nodeColors] || "#374151"}`,
                    color: nodeColors[n.data.color as keyof typeof nodeColors] || "#d1d5db",
                    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 0 10px ${nodeColors[n.data.color as keyof typeof nodeColors]
                        }33`,
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    minWidth: "150px",
                    textAlign: "center",
                },
            })),
        [initialNodes]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(styledNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Allow manual connections (though usually this graph is read-only)
    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds) =>
                addEdge(
                    { ...params, type: ConnectionLineType.SmoothStep, animated: true },
                    eds
                )
            ),
        [setEdges]
    );

    // Empty state handling
    if (initialNodes.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center border border-white/10 rounded-xl bg-black/40 backdrop-blur-md">
                <p className="text-gray-500 font-mono">No dependency graph available. Analyze a repository.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full border border-white/10 rounded-xl overflow-hidden bg-black/80">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={1.5}
            >
                <Background
                    color="#334155"
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1.5}
                />
                <Controls
                    className="bg-gray-900 border-gray-700 fill-white !mt-2"
                    position="bottom-left"
                />
                <MiniMap
                    nodeColor={(n: any) =>
                        nodeColors[n.data?.color as keyof typeof nodeColors] || "#475569"
                    }
                    maskColor="rgba(0, 0, 0, 0.6)"
                    className="bg-gray-900 border-gray-700"
                    position="bottom-right"
                />

                {/* Legend Overlay */}
                <Panel position="top-right" className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 font-mono text-xs">
                    <div className="text-white font-bold mb-2">Complexity Map</div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-gray-300">Beginner Friendly</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                            <span className="text-gray-300">Intermediate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            <span className="text-gray-300">Advanced / Core</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-gray-400"></div>
                            <span className="text-gray-400 italic">Imports / Depends on</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
