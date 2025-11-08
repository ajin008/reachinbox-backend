import { esClient } from "../services/elasticsearch.ts";
import type { Request, Response } from "express";
import type { EmailDocument } from "../types/index.ts";
import dotenv from "dotenv";
import { getEmailByIdFromES } from "../services/emailStore.ts";
import { embedText } from "../utils/embedText.ts";
import { searchKB } from "../vector/index.ts";
import { generateAIReply } from "../services/ai/generateAIReply.ts";
import { sendReplayEmail } from "../services/mailer.ts";
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

export const sendAiReplay = async (req: Request, res: Response) => {
  try {
    const { mailId } = req.body;

    if (!mailId) {
      return res.status(400).json({ error: "mailId is required" });
    }

    const email = await getEmailByIdFromES(mailId);
    // console.log("data from email", email);
    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    if (!email.from) {
      return res.status(400).json({ error: "Email has no 'from' field" });
    }

    const embedding = await embedText(
      `${email.subject}\n${email.from}\n${email.body}`
    );
    // console.log("data from embedding:", embedding);

    const kbMatch = await searchKB(embedding);
    // console.log("data from kbMatch:", kbMatch);

    const replayText = await generateAIReply(email.body, kbMatch);
    // console.log("data from replayText", replayText);

    const sent = await sendReplayEmail(email.from, replayText ?? "");
    // console.log("data from sent", sent);

    return res.json({
      success: true,
      reply: replayText,
      sent,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send mails" });
  }
};
