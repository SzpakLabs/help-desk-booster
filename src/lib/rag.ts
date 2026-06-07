import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import MiniSearch from "minisearch";

export type KnowledgeSearchMode = "langchain-vector" | "minisearch-keyword";

export type KnowledgeSearchResult = {
  title: string;
  source: string;
  excerpt: string;
  score: number;
};

export type KnowledgeSearchResponse = {
  query: string;
  mode: KnowledgeSearchMode;
  results: KnowledgeSearchResult[];
  note?: string;
};

type KnowledgeDoc = {
  id: string;
  title: string;
  source: string;
  content: string;
};

type IndexedKnowledgeDoc = KnowledgeDoc & {
  id: string;
};

let docsPromise: Promise<KnowledgeDoc[]> | undefined;
let vectorStorePromise: Promise<MemoryVectorStore> | undefined;
let miniSearchPromise: Promise<MiniSearch<IndexedKnowledgeDoc>> | undefined;

async function readKnowledgeDocs() {
  if (!docsPromise) {
    docsPromise = (async () => {
      const docsDir = path.join(process.cwd(), "docs", "knowledge-base");
      const files = (await readdir(docsDir)).filter((file) => file.endsWith(".md"));
      const docs = await Promise.all(
        files.map(async (file) => {
          const source = path.join("docs", "knowledge-base", file);
          const content = await readFile(path.join(docsDir, file), "utf8");
          const title =
            content
              .split("\n")
              .find((line) => line.startsWith("# "))
              ?.replace("# ", "")
              .trim() ?? file.replace(".md", "");

          return {
            id: file.replace(".md", ""),
            title,
            source,
            content,
          };
        }),
      );

      return docs.sort((left, right) => left.title.localeCompare(right.title));
    })();
  }

  return docsPromise;
}

async function buildVectorStore() {
  if (!vectorStorePromise) {
    vectorStorePromise = (async () => {
      const docs = await readKnowledgeDocs();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 900,
        chunkOverlap: 140,
      });
      const documents = docs.map(
        (doc) =>
          new Document({
            pageContent: doc.content,
            metadata: {
              title: doc.title,
              source: doc.source,
            },
          }),
      );
      const chunks = await splitter.splitDocuments(documents);
      const embeddings = new OpenAIEmbeddings({
        model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
      });

      return MemoryVectorStore.fromDocuments(chunks, embeddings);
    })();
  }

  return vectorStorePromise;
}

async function buildMiniSearch() {
  if (!miniSearchPromise) {
    miniSearchPromise = (async () => {
      const docs = await readKnowledgeDocs();
      const index = new MiniSearch<IndexedKnowledgeDoc>({
        fields: ["title", "content"],
        storeFields: ["title", "source", "content"],
        searchOptions: {
          boost: { title: 2.4 },
          fuzzy: 0.18,
          prefix: true,
        },
      });

      index.addAll(docs);
      return index;
    })();
  }

  return miniSearchPromise;
}

function excerpt(content: string, query: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  const queryTerm = query
    .split(/\s+/)
    .find((term) => term.length > 3)
    ?.toLowerCase();
  const start = queryTerm ? compact.toLowerCase().indexOf(queryTerm) : -1;
  const offset = Math.max(start - 130, 0);
  const slice = compact.slice(offset, offset + 360);
  return `${offset > 0 ? "..." : ""}${slice}${offset + 360 < compact.length ? "..." : ""}`;
}

async function keywordSearch(query: string, limit: number): Promise<KnowledgeSearchResponse> {
  const index = await buildMiniSearch();
  const docs = await readKnowledgeDocs();
  const hits = index.search(query).slice(0, limit);
  const results =
    hits.length > 0
      ? hits.map((hit) => ({
          title: String(hit.title),
          source: String(hit.source),
          excerpt: excerpt(String(hit.content), query),
          score: Number(hit.score),
        }))
      : docs.slice(0, limit).map((doc) => ({
          title: doc.title,
          source: doc.source,
          excerpt: excerpt(doc.content, query),
          score: 0,
        }));

  return {
    query,
    mode: "minisearch-keyword",
    results,
  };
}

export async function searchKnowledgeBase(query: string, limit = 4): Promise<KnowledgeSearchResponse> {
  const normalized = query.trim() || "SLA triage error code runbook";

  if (!process.env.OPENAI_API_KEY) {
    return {
      ...(await keywordSearch(normalized, limit)),
      note: "OPENAI_API_KEY is not set, so retrieval used MiniSearch keyword fallback.",
    };
  }

  try {
    const vectorStore = await buildVectorStore();
    const scored = await vectorStore.similaritySearchWithScore(normalized, limit);

    return {
      query: normalized,
      mode: "langchain-vector",
      results: scored.map(([doc, score]) => ({
        title: String(doc.metadata.title),
        source: String(doc.metadata.source),
        excerpt: excerpt(doc.pageContent, normalized),
        score,
      })),
    };
  } catch {
    const fallback = await keywordSearch(normalized, limit);
    return {
      ...fallback,
      note: "LangChain vector retrieval failed, so MiniSearch fallback was used. Check OPENAI_API_KEY and OPENAI_EMBEDDING_MODEL.",
    };
  }
}

export async function getKnowledgeManifest() {
  const docs = await readKnowledgeDocs();
  return docs.map((doc) => ({
    title: doc.title,
    source: doc.source,
    excerpt: excerpt(doc.content, doc.title),
  }));
}
