(async () => {
  try {
    const inputPath = process.argv[2] || "./data/docs";
    await require("../rag/indexer").indexPath(inputPath);
    console.log("Indexing done:", inputPath);
  } catch (e) {
    console.error("Indexing failed:", e?.message || e);
    process.exit(1);
  }
})();
