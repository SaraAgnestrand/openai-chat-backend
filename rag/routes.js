const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { indexFiles } = require("./indexer");
const { semanticSearch } = require("./query");

router.post("/api/rag/index", upload.array("files"), async (req, res) => {
  try {
    const files = (req.files || []).map((f) => ({
      filename: f.originalname,
      buffer: f.buffer,
      mimetype: f.mimetype,
    }));
    const result = await indexFiles(files);
    res.json({ ok: true, ...result });
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

router.get("/api/rag/health", async (req, res) => {
  try {
    return res.json({ ok: true, backend: "chroma", indexCount: null });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;
