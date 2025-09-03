require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(require("./rag/routes"));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function truncateMessages(messages, max = 24) {
  if (!Array.isArray(messages)) return [];
  return messages.length <= max
    ? messages
    : messages.slice(messages.length - max);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], model = "gpt-4o-mini", system } = req.body;

    const finalMessages = [
      ...(system ? [{ role: "system", content: system }] : []),
      ...truncateMessages(messages),
    ];

    const resp = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature: 0.7,
    });

    const msg = resp.choices?.[0]?.message;
    if (!msg) return res.status(502).json({ error: "No message from model" });

    res.json({ reply: msg });
  } catch (err) {
    console.error("API error:", err?.response?.data ?? err?.message ?? err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API lyssnar på http://localhost:${PORT}`));
