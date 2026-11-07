import crypto from "node:crypto";
import { sendReplyEmail } from "../../infra/mailer.client.ts";
import { sendSlackNotification } from "../../infra/slack.client.ts";
import { emitNewEmail } from "../../infra/socket.ts";
import { sendWhatsAppNotification } from "../../infra/whatsapp.client.ts";
import { generateGroundedReply } from "../ai/rag.service.ts";
import { classifyEmailIntent } from "../ai/triage.service.ts";
import {
  emailExistsById,
  findEmailById,
  findEmailsByFilter,
  findEmailsPaginated,
  saveEmailDocument,
  searchEmailsFullText,
} from "./email.repository.ts";
import type {
  EmailFilterParams,
  StoredEmail,
  StoreEmailInput,
} from "./email.types.ts";

export function buildDeterministicEmailId(
  email: StoreEmailInput,
  uniqueKey?: string
): string {
  const rawKey = `${email.account}:${email.folder}:${
    uniqueKey || `${email.from}:${email.subject}:${email.date}`
  }`;
  return crypto.createHash("sha256").update(rawKey).digest("hex").slice(0, 32);
}

export async function ingestEmail(
  email: StoreEmailInput,
  uniqueKey?: string
): Promise<StoredEmail | null> {
  try {
    const id = buildDeterministicEmailId(email, uniqueKey);

    // Deduplication check: skip re-indexing, LLM call, and Slack spam if already stored
    const alreadyExists = await emailExistsById(id);
    if (alreadyExists) {
      return null;
    }

    const category = await classifyEmailIntent(email.subject, email.body);

    const storedEmail = await saveEmailDocument(id, {
      ...email,
      category,
    });

    // Push complete email payload (including category!) over WebSocket
    emitNewEmail(storedEmail);

    // Trigger Slack & WhatsApp alerts only for newly ingested "Interested" leads
    if (category === "Interested") {
      const senderAddress =
        email.from.match(/<([^>]+)>/)?.[1] || email.from;
      const alertMessage = `New Interested Lead! from ${senderAddress} with subject: ${email.subject}`;

      await Promise.allSettled([
        sendSlackNotification(alertMessage),
        sendWhatsAppNotification(alertMessage),
      ]);
    }

    console.log("Stored email:", storedEmail.id, "| Category:", category);
    return storedEmail;
  } catch (error) {
    console.error("Error ingesting email:", error);
    return null;
  }
}

export async function listEmails(page = 1, limit = 10) {
  return await findEmailsPaginated(page, limit);
}

export async function getEmailByIdService(id: string) {
  return await findEmailById(id);
}

export async function filterEmailsService(filters: EmailFilterParams) {
  return await findEmailsByFilter(filters);
}

export async function searchEmailsService(query: string) {
  const emails = await searchEmailsFullText(query);
  return {
    emails,
    total: emails.length,
    page: 1,
    limit: emails.length,
  };
}

export async function generateAndSendAiReplyService(mailId: string) {
  const email = await findEmailById(mailId);
  if (!email) {
    return { status: 404 as const, error: "Email not found" };
  }

  if (!email.from) {
    return { status: 400 as const, error: "Email has no 'from' field" };
  }

  const replyText = await generateGroundedReply({
    subject: email.subject,
    from: email.from,
    body: email.body,
  });

  const sent = await sendReplyEmail(email.from, email.subject, replyText);

  return {
    status: 200 as const,
    data: {
      success: true,
      reply: replyText,
      sent,
    },
  };
}
