import { esClient } from "./elasticsearch.ts";

export async function searchEmail(query: string) {
  try {
    const result = await esClient.search({
      index: "emails",
      query: {
        multi_match: {
          query,
          fields: ["subject", "from", "to", "body"],
          fuzziness: "AUTO",
        },
      },
    });
    return result.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...(hit._source ?? {}),
    }));
  } catch (error) {
    console.log("Error searching emails in Es:", error);
  }
}
