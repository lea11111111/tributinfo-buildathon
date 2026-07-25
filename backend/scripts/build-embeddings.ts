/**
 * Genera embeddings.json desde corpus/parsed/*.md
 * Uso: pnpm --filter tributinfo-backend run build:embeddings
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildFromCorpusDir, repoRootFromHere } from "../lib/rag/tfidf";

const root = repoRootFromHere();
const parsedDir = join(root, "corpus", "parsed");
const outPath = join(root, "embeddings.json");

const files = readdirSync(parsedDir).filter((f) => f.endsWith(".md"));
if (files.length === 0) {
  console.error(`No hay .md en ${parsedDir}. Copiá el corpus primero (ver corpus/README.md).`);
  process.exit(1);
}

const index = buildFromCorpusDir(parsedDir);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(index, null, 2), "utf-8");

console.log(
  JSON.stringify(
    {
      ok: true,
      output: outPath,
      documents: files.length,
      chunks: index.chunks.length,
      embeddingModel: index.embeddingModel,
    },
    null,
    2,
  ),
);
