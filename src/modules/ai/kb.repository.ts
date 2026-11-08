import { esClient } from "../../infra/elasticsearch.client.ts";

const KB_INDEX = "kb_docs";
const EMBEDDING_DIMS = 768; // Must be <= 2048 for Elasticsearch 8.7 dense_vector

export interface KBDocument {
  id?: string;
  score?: number;
  title: string;
  content: string;
  created_at?: string;
}

export async function ensureKBIndex(): Promise<void> {
  const exists = await esClient.indices.exists({ index: KB_INDEX });

  if (exists) {
    return;
  }

  await esClient.indices.create({
    index: KB_INDEX,
    mappings: {
      properties: {
        title: { type: "keyword" },
        content: { type: "text" },
        created_at: { type: "date" },
        embedding: {
          type: "dense_vector",
          dims: EMBEDDING_DIMS,
          index: true,
          similarity: "cosine",
        },
      },
    },
  });

  console.log("Created Elasticsearch index:", KB_INDEX);
}

export async function indexKBChunk(doc: {
  title: string;
  content: string;
  embedding: number[];
}): Promise<void> {
  await esClient.index({
    index: KB_INDEX,
    document: {
      title: doc.title,
      content: doc.content,
      created_at: new Date().toISOString(),
      embedding: doc.embedding,
    },
  });
}

export async function refreshKBIndex(): Promise<void> {
  await esClient.indices.refresh({ index: KB_INDEX });
}

export async function clearKBIndex(): Promise<void> {
  const exists = await esClient.indices.exists({ index: KB_INDEX });
  if (exists) {
    await esClient.deleteByQuery({
      index: KB_INDEX,
      query: { match_all: {} },
      refresh: true,
    });
  }
}

export async function searchKnowledgeBase(
  embedding: number[],
  k = 3
): Promise<KBDocument[]> {
  const result = await esClient.search({
    index: KB_INDEX,
    knn: {
      field: "embedding",
      query_vector: embedding,
      k,
      num_candidates: 10,
    },
  });

  return result.hits.hits.map((hit: any) => ({
    id: hit._id,
    score: hit._score,
    ...(hit._source ?? {}),
  }));
}
