import { simpleParser, type ParsedMail } from "mailparser";
import { ENV } from "../../config/env.ts";
import { imapClient } from "../../infra/imap.client.ts";
import { ingestEmail } from "./email.service.ts";

export async function startImapWorker(): Promise<void> {
  await imapClient.connect();
  console.log("IMAP client connected");

  await imapClient.getMailboxLock("INBOX");
  console.log("Mailbox INBOX opened");

  console.log("Syncing emails from the last 30 days...");
  const since = new Date();
  since.setDate(since.getDate() - 30);

  for await (const message of imapClient.fetch(
    { since },
    { uid: true, envelope: true, source: true }
  )) {
    const raw = await message.source;
    if (!raw) continue;

    const parsed: ParsedMail = await simpleParser(raw);

    const emailData = {
      subject: parsed.subject || "",
      from: parsed.from?.text || "",
      to: parsed.to?.text || "",
      date: parsed.date?.toISOString() || new Date().toISOString(),
      body: parsed.text || parsed.html || "",
      account: ENV.emailUser,
      folder: "INBOX",
    };

    const uniqueKey =
      parsed.messageId ||
      message.envelope?.messageId ||
      (message.uid ? String(message.uid) : undefined);

    await ingestEmail(emailData, uniqueKey);
  }

  imapClient.on("exists", async () => {
    console.log("New email arrived in INBOX");

    if (!imapClient.mailbox) {
      console.warn("Mailbox not ready");
      return;
    }

    const messageCount = imapClient.mailbox.exists;

    const latest = await imapClient.fetchOne(String(messageCount), {
      uid: true,
      envelope: true,
      source: true,
    });

    if (!latest || !latest.envelope || !latest.source) {
      console.warn("Skipped email — incomplete envelope or source");
      return;
    }

    let parsed: ParsedMail;
    try {
      parsed = await simpleParser(latest.source);
    } catch (err) {
      console.error("mailparser failed:", err);
      return;
    }

    const emailData = {
      subject: parsed.subject || "",
      from: parsed.from?.text || "",
      to: parsed.to?.text || "",
      date: parsed.date?.toISOString() || new Date().toISOString(),
      body: parsed.text || parsed.html || "",
      account: ENV.emailUser,
      folder: "INBOX",
    };

    const uniqueKey =
      parsed.messageId ||
      latest.envelope.messageId ||
      (latest.uid ? String(latest.uid) : undefined);

    await ingestEmail(emailData, uniqueKey);
  });

  console.log("Listening for new emails via IMAP IDLE...");
}
