require("dotenv").config();
const OpenAI = require("openai");
const readline = require("readline");

if (!process.env.OPENAI_API_KEY) {
  console.error("Saknar OPENAI_API_KEY i .env");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async function main() {
  console.log("Chatbot startad! Skriv 'exit' för att avsluta.\n");

  while (true) {
    const input = await new Promise((resolve) => rl.question("Du: ", resolve));
    const prompt = input.trim();

    if (!prompt) {
      console.log("(tom rad — skriv något eller 'exit')\n");
      continue;
    }
    if (prompt.toLowerCase() === "exit") break;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 80, // justera själv vid experiment
      });

      const reply = response.choices[0].message.content;
      console.log("Bot:", reply, "\n");

      // 👇 logga token-användning
      if (response.usage) {
        console.log("Token-användning:");
        console.log("  prompt_tokens:", response.usage.prompt_tokens);
        console.log("  completion_tokens:", response.usage.completion_tokens);
        console.log("  total_tokens:", response.usage.total_tokens, "\n");
      }
    } catch (err) {
      console.error("Fel:", err?.response?.data ?? err.message ?? err);
    }
  }

  rl.close();
})();
