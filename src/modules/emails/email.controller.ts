import type { Request, Response } from "express";
import { ENV } from "../../config/env.ts";
import {
  filterEmailsService,
  generateAndSendAiReplyService,
  getEmailByIdService,
  listEmails,
  searchEmailsService,
} from "./email.service.ts";

export const getAllMail = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);

    const result = await listEmails(page, limit);
    res.json(result);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmailById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const email = await getEmailByIdService(id);
    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }
    res.json({ email });
  } catch (err) {
    console.error("Error fetching email by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const filterEmails = async (req: Request, res: Response) => {
  const { account, folder, category } = req.query;

  try {
    const emails = await filterEmailsService({
      account: typeof account === "string" ? account : undefined,
      folder: typeof folder === "string" ? folder : undefined,
      category: typeof category === "string" ? category : undefined,
    });

    res.json({ emails });
  } catch (err) {
    console.error("Filter query failed:", err);
    res.status(500).json({ error: "Filter query failed" });
  }
};

export const mailSearch = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const result = await searchEmailsService(q);
    res.json(result);
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const getCurrentAccount = (_req: Request, res: Response) => {
  if (!ENV.emailUser) {
    return res.status(404).json({ error: "EMAIL_USER not configured" });
  }

  res.json({ account: ENV.emailUser });
};

export const sendAiReplay = async (req: Request, res: Response) => {
  try {
    const { mailId } = req.body;

    if (!mailId) {
      return res.status(400).json({ error: "mailId is required" });
    }

    const result = await generateAndSendAiReplyService(mailId);
    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.json(result.data);
  } catch (err) {
    console.error("Failed to generate/send AI reply:", err);
    res.status(500).json({ error: "Failed to send mail" });
  }
};
