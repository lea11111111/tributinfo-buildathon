/**
 * Genera cache local del índice TF-IDF y un resumen commiteable.
 * Uso: pnpm --filter tributinfo-backend run build:embeddings
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildFromCorpusDir, repoRootFromHere } from "../lib/rag/tfidf";

const root = repoRootFromHere();
const parsedDir = join(root, "corpus", "parsed");
const cachePath = join(root, "backend", ".cache", "embeddings.json");
const statsPath = join(root, "corpus", "stats.json");

const files = readdirSync(parsedDir).filter((f) => f.endsWith(".md"));
if (files.length === 0) {
  console.error(`No hay .md en ${parsedDir}. Copiá el corpus primero (ver corpus/README.md).`);
  process.exit(1);
}

const index = buildFromCorpusDir(parsedDir);
mkdirSync(dirname(cachePath), { recursive: true });
writeFileSync(cachePath, JSON.stringify(index), "utf-8");

const stats = {
  embeddingModel: index.embeddingModel,
  documents: files.length,
  chunks: index.chunks.length,
  sources: files.sort(),
  generatedAt: new Date().toISOString(),
  cachePath: "backend/.cache/embeddings.json",
};

writeFileSync(statsPath, JSON.stringify(stats, null, 2), "utf-8");

console.log(JSON.stringify({ ok: true, ...stats }, null, 2));
