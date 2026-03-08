import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import OpenAI from "openai";

// Initialize OpenAI client configured for OpenRouter.
// This now matches the minimal config that worked in your test script.
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
console.log(
    "[chat] OPENROUTER_API_KEY prefix:",
    openRouterApiKey?.slice(0, 10),
    "length:",
    openRouterApiKey?.length ?? "undefined"
);

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: openRouterApiKey,
});

// Force dynamic execution for streaming
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return new Response("Unauthorized", { status: 401 });
        }

        if (!openRouterApiKey) {
            return new Response("Server misconfigured: OPENROUTER_API_KEY is not set.", { status: 500 });
        }

        const { messages, repoContext, owner, repo } = await req.json();

        if (!messages || !owner || !repo) {
            return new Response("Missing required fields", { status: 400 });
        }

        // Prepare system prompt with repo context
        const systemPrompt = `You are "RepoGuide", an expert code guide for the ${owner}/${repo} repository. 
You are speaking to a developer who is trying to understand this codebase.

Here is the context of the repository's file structure and complexity:
${repoContext || "No context provided."}

INSTRUCTIONS:
1. Be extremely helpful, concise, and accurate.
2. When referencing specific files, ALWAYS include a markdown link to the GitHub file: \`[filename](https://github.com/${owner}/${repo}/blob/main/path/to/file)\`.
3. If you need to read the exact contents of a file to answer a question, you can ask the user.
4. Try to explain complex logic simply.
5. Provide a confidence score (0-100%) at the end of your technical answers.`;

        // Last message from the user
        const userMessage = messages[messages.length - 1];

        // Previous conversation history
        const conversationHistory = messages.slice(0, -1).map((m: any) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content
        }));

        // Add current message
        conversationHistory.push({
            role: "user",
            content: userMessage.content
        });

        // We'll use the streaming API for real-time responses
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            stream: true,
            messages: [
                { role: "system", content: systemPrompt },
                ...conversationHistory
            ],
        });

        // Convert OpenAI stream to a standard ReadableStream of raw text
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            }
        });

        // Return the readable stream directly to the client
        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
