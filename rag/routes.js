const express = require("express");
const router = express.Router();
const path = require("node:path");
const { indexPath } = require("./indexer");
const { semanticSearch } = require("./query");

router.post("/api/rag/index", async (req, res) => {
  try {
    const { inputPath = "./data/docs" } = req.body || {};
    const abs = path.isAbsolute(inputPath)
      ? inputPath
      : path.join(process.cwd(), inputPath);
    await indexPath(abs);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.post("/api/rag/query", async (req, res) => {
  try {
    const { q, topK = 4, docId } = req.body || {};
    if (!q) return res.status(400).json({ error: "Missing q" });
    const where = docId ? { docId } : undefined;
    const hits = await semanticSearch(q, topK, "docs", where);
    res.json({ hits });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

module.exports = router;
