import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
console.log("Key prefix:", apiKey?.slice(0, 10), "length:", apiKey?.length);

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
});

async function run() {
  try {
    const res = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "ping" }],
    });
    console.log("OK:", res.choices[0].message);
  } catch (err) {
    console.error(
      "Error:",
      err.status,
      err.message,
      err.response?.data || ""
    );
  }
}

run();