"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatProps {
    owner: string;
    repo: string;
    repoContext: string;
}

export function Chat({ owner, repo, repoContext }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hi! I'm RepoGuide, your AI assistant for **${owner}/${repo}**. I've analyzed the codebase and I'm ready to answer any questions. What would you like to know?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Add empty assistant message that we will stream into
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg], // Send history
                    repoContext,
                    owner,
                    repo,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error("No response body returned");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    // Note: Anthropic's SDK stream returning native SSE format looks like:
                    // event: content_block_delta
                    // data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

                    // For simplicity in this implementation, we assume the raw text stream from Next.js Response
                    // We append whatever text chunk comes in to the last assistant message
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMsg = newMessages[newMessages.length - 1];
                        if (lastMsg.role === "assistant") {
                            lastMsg.content += chunk;
                        }
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Sorry, I encountered an error while processing your request." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
            {/* Header */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="text-cyan-400">✨</span> RepoGuide AI
                </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 ${m.role === "user"
                                    ? "bg-cyan-500/20 text-cyan-50 border border-cyan-500/30 rounded-br-sm"
                                    : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-sm"
                                }`}
                        >
                            {m.role === "assistant" ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                return match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="rounded-md my-2"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, "")}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-300" {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            a({ node, className, children, href, ...props }: any) {
                                                return (
                                                    <a href={href} className="text-cyan-400 hover:underline" target="_blank" rel="noreferrer" {...props}>
                                                        {children}
                                                    </a>
                                                );
                                            }
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 text-gray-400 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-3 flex gap-1 items-center">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-75"></span>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-black/50 border-t border-white/10">
                <div className="relative flex items-end">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about the architecture, or where logging is handled..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none min-h-[50px] max-h-[200px]"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                        </svg>
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-500">Press Enter to send, Shift+Enter for new line</span>
                </div>
            </div>
        </div>
    );
}
