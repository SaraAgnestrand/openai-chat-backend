require("dotenv").config();

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE || 800);
const CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP || 120);

function chunkText(docId, text) {
  const out = [];
  let i = 0,
    idx = 0;
  while (i < text.length) {
    const piece = text.slice(i, i + CHUNK_SIZE);
    out.push({ id: `${docId}-${idx++}`, docId, content: piece });
    i += Math.max(1, CHUNK_SIZE - CHUNK_OVERLAP);
  }
  return out;
}

module.exports = { chunkText };
