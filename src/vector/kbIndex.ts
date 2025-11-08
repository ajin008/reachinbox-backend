import { esClient } from "../services/elasticsearch.ts";

export async function ensureKBIndex() {
  const index = "kb_docs";
  const exists = await esClient.indices.exists({ index });

  if (exists) {
    console.log("kb_docs index already exists");
    return;
  }

  await esClient.indices.create({
    index,
    mappings: {
      properties: {
        title: { type: "keyword" },
        content: { type: "keyword" },
        created_at: { type: "date" },
        embedding: {
          type: "dense_vector",
          dims: 1536,
          index: true,
          similarity: "cosine",
        },
      },
    },
  });
  console.log("Created kb_docs index");
}
