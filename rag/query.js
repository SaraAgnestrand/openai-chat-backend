const { getCollection } = require("./store");

async function semanticSearch(q, topK = 5, collectionName = "docs", where) {
  const col = await getCollection(collectionName);
  const res = await col.query({ queryTexts: [q], nResults: topK, where });
  const docs = res.documents?.[0] || [];
  return docs.map((content, i) => ({
    content,
    score: res.distances?.[0]?.[i] ?? 0,
    meta: res.metadatas?.[0]?.[i] ?? {},
  }));
}

module.exports = { semanticSearch };
