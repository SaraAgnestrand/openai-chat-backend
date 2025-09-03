require("dotenv").config();
const { ChromaClient } = require("chromadb");
const OpenAI = require("openai");

const url = new URL(process.env.CHROMA_URL || "http://localhost:8000");
const client = new ChromaClient({
  host: url.hostname,
  port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
  ssl: url.protocol === "https:",
});

const oa = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

const embeddingFunction = {
  async generate(texts) {
    const res = await oa.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });
    return res.data.map((d) => d.embedding);
  },
};

async function getCollection(name = "docs") {
  return client.getOrCreateCollection({ name, embeddingFunction });
}

module.exports = { getCollection };
