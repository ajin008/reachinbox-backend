import { esClient } from "../services/elasticsearch.ts";
import type { Request, Response } from "express";
import type { EmailDocument } from "../types/index.ts";
import dotenv from "dotenv";
dotenv.config();

export const getAllMail = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;

    const result = await esClient.search({
      index: "emails",
      from,
      size: limit,
      query: {
        match_all: {},
      },
      sort: [{ date: { order: "desc" } }],
    });
    const emails = result.hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source as EmailDocument),
    }));
    console.log("getAllEmail return info:", emails);
    const total = (result.hits.total as any)?.value ?? 0;

    res.json({ emails, page, limit, total });
  } catch (err) {
    console.error("error fetching emails:", err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getEmailById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await esClient.get({
      index: "emails",
      id,
    });
    res.json({ email: result._source });
  } catch (err) {
    console.error("error fetching email by Id:", err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const filterEmails = async (req: Request, res: Response) => {
  const { account, folder, category } = req.query;

  const mustFilters = [];

  if (account) mustFilters.push({ term: { account } });
  if (folder) mustFilters.push({ term: { folder } });
  if (category) mustFilters.push({ term: { category } });

  try {
    const result = await esClient.search({
      index: "emails",
      query: {
        bool: {
          must: mustFilters,
        },
      },
    });

    const emails = result.hits.hits.map((hit) => ({
      id: hit._id,
      ...(hit._source as EmailDocument),
    }));

    res.json({ emails });
  } catch (err) {
    res.status(500).json({ error: "Filter query failed" });
  }
};

export const getCurrentAccount = (req: Request, res: Response) => {
  try {
    const account = process.env.EMAIL_USER;

    if (!account) {
      return res.status(404).json({ error: "EMAIL_USER not configured" });
    }

    res.json({ account });
  } catch (err) {
    console.error("Error fetching account:", err);
    res.status(500).json({ error: "Failed to fetch account" });
  }
};
