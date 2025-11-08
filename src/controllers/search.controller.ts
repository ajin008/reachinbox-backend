import type { Request, Response } from "express";
import { esClient } from "../services/elasticsearch.ts";

export const mailSearch = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const result = await esClient.search({
      index: "emails",
      query: {
        multi_match: {
          query: q,
          fields: ["subject", "from", "to", "body"],
          fuzziness: "AUTO",
        },
      },
    });

    const emails = result.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      ...(hit._source ?? {}),
    }));

    res.json({
      emails,
      total: emails.length,
      page: 1,
      limit: emails.length,
    });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
};
