import { esClient } from "../services/elasticsearch.ts";

export async function searchKB(embedding: number[]) {
  const result = await esClient.search({
    index: "kb_docs",
    knn: {
      field: "embedding",
      query_vector: embedding,
      k: 3,
      num_candidates: 10,
    },
  });
  return result.hits.hits.map((hit: any) => ({
    id: hit._id,
    score: hit._score,
    ...hit._source,
  }));
}
