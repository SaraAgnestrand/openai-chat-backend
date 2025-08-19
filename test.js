require("dotenv").config();
const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.error("Saknar OPENAI_API_KEY i .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Säg: Hej!" }],
      temperature: 0.2,
    });
    console.log("OK:", resp.choices[0].message.content);
  } catch (err) {
    console.error("Fel:", err?.response?.data ?? err.message ?? err);
  }
}

main();
