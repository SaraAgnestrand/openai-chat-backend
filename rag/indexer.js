const fs = require("node:fs/promises");
const path = require("node:path");
const { chunkText } = require("./chunk");
const { getCollection } = require("./store");

async function indexPath(inputPath, collectionName = "docs") {
  const stat = await fs.stat(inputPath);
  const col = await getCollection(collectionName);

  const files = stat.isDirectory()
    ? (await fs.readdir(inputPath)).map((f) => path.join(inputPath, f))
    : [inputPath];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (![".txt", ".md"].includes(ext)) continue;

    const text = await fs.readFile(file, "utf8");
    const docId = path.basename(file);
    const chunks = chunkText(docId, text);

    await col.upsert({
      ids: chunks.map((c) => c.id),
      documents: chunks.map((c) => c.content),
      metadatas: chunks.map((c) => ({ docId, path: file })),
    });

    console.log(`Indexed ${file} (${chunks.length} chunks)`);
  }
}

module.exports = { indexPath };
