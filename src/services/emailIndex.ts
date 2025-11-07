import { esClient } from "./elasticsearch.ts";

export async function createEmailIndex() {
  const indexName = "emails";

  const exists = await esClient.indices.exists({ index: indexName });

  if (exists === true) {
    console.log(`index ${indexName} already exists`);
    return;
  }

  await esClient.indices.create({
    index: indexName,
    mappings: {
      properties: {
        subject: { type: "text" },
        from: { type: "keyword" },
        to: { type: "keyword" },
        date: { type: "date" },
        body: { type: "text" },
        account: { type: "keyword" },
        folder: { type: "keyword" },
        categories: { type: "keyword" },
      },
    },
  });

  console.log("created elasticsearch index ", indexName);
}
