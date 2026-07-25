import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type CorpusChunk = {
  id: string;
  source: string;
  chunkIndex: number;
  text: string;
  vector: Record<string, number>;
};

export type EmbeddingsIndex = {
  embeddingModel: string;
  idf: Record<string, number>;
  chunks: CorpusChunk[];
};

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;
const MIN_CHUNK_CHARS = 120;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function termFreq(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    tf[token] = (tf[token] ?? 0) + 1;
  }
  const max = Math.max(...Object.values(tf), 1);
  for (const key of Object.keys(tf)) {
    tf[key] = 0.5 + 0.5 * (tf[key] / max);
  }
  return tf;
}

function dot(a: Record<string, number>, b: Record<string, number>): number {
  let sum = 0;
  for (const [key, val] of Object.entries(a)) {
    if (b[key] != null) sum += val * b[key];
  }
  return sum;
}

function norm(vec: Record<string, number>): number {
  return Math.sqrt(dot(vec, vec));
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  const denom = norm(a) * norm(b);
  return denom === 0 ? 0 : dot(a, b) / denom;
}

export function cleanText(text: string): string {
  return text
    .replace(/\[Image:[^\]]*\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkMarkdown(text: string, source: string): Omit<CorpusChunk, "vector">[] {
  const chunks: Omit<CorpusChunk, "vector">[] = [];
  let start = 0;
  let index = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const piece = text.slice(start, end).trim();
    if (piece.length >= MIN_CHUNK_CHARS) {
      chunks.push({
        id: `${source}:${index}`,
        source,
        chunkIndex: index,
        text: piece,
      });
      index += 1;
    }
    if (end >= text.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return chunks;
}

export function buildTfidfIndex(rawChunks: Omit<CorpusChunk, "vector">[]): EmbeddingsIndex {
  const docFreq: Record<string, number> = {};
  const tokenized = rawChunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    const unique = new Set(tokens);
    for (const token of unique) {
      docFreq[token] = (docFreq[token] ?? 0) + 1;
    }
    return tokens;
  });

  const n = rawChunks.length;
  const idf: Record<string, number> = {};
  for (const [term, df] of Object.entries(docFreq)) {
    idf[term] = Math.log((1 + n) / (1 + df)) + 1;
  }

  const chunks: CorpusChunk[] = rawChunks.map((chunk, i) => {
    const tf = termFreq(tokenized[i]);
    const vector: Record<string, number> = {};
    for (const [term, weight] of Object.entries(tf)) {
      vector[term] = weight * (idf[term] ?? 1);
    }
    return { ...chunk, vector };
  });

  return {
    embeddingModel: "tfidf-v1",
    idf,
    chunks,
  };
}

export function buildFromCorpusDir(corpusDir: string): EmbeddingsIndex {
  if (!existsSync(corpusDir)) {
    throw new Error(`Corpus no encontrado: ${corpusDir}`);
  }
  const files = readdirSync(corpusDir).filter((f) => f.endsWith(".md"));
  const rawChunks: Omit<CorpusChunk, "vector">[] = [];
  for (const file of files.sort()) {
    const text = cleanText(readFileSync(join(corpusDir, file), "utf-8"));
    rawChunks.push(...chunkMarkdown(text, file));
  }
  if (rawChunks.length === 0) {
    throw new Error(`No hay markdown en ${corpusDir}`);
  }
  return buildTfidfIndex(rawChunks);
}

let cachedIndex: EmbeddingsIndex | null = null;

export function repoRootFromHere(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "..", "..");
}

export function loadEmbeddingsIndex(): EmbeddingsIndex {
  if (cachedIndex) return cachedIndex;

  const root = repoRootFromHere();
  const parsedDir = join(root, "corpus", "parsed");
  const cachePath = join(root, "backend", ".cache", "embeddings.json");

  if (existsSync(cachePath)) {
    cachedIndex = JSON.parse(readFileSync(cachePath, "utf-8")) as EmbeddingsIndex;
    return cachedIndex;
  }

  cachedIndex = buildFromCorpusDir(parsedDir);
  return cachedIndex;
}

export function searchCorpus(query: string, topK = 5): Array<CorpusChunk & { score: number }> {
  const index = loadEmbeddingsIndex();
  const expectedModel = process.env.EMBEDDING_MODEL ?? "tfidf-v1";
  if (index.embeddingModel !== expectedModel) {
    throw new Error(
      `Modelo de embeddings incompatible: index=${index.embeddingModel}, env=${expectedModel}`,
    );
  }

  const tokens = tokenize(query);
  const tf = termFreq(tokens);
  const queryVec: Record<string, number> = {};
  for (const [term, weight] of Object.entries(tf)) {
    queryVec[term] = weight * (index.idf[term] ?? 1);
  }

  return index.chunks
    .map((chunk) => ({ ...chunk, score: cosine(queryVec, chunk.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
