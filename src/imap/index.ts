import { storeEmailInEs } from "../services/emailStore.ts";
import { imapClient } from "./client.ts";
import { simpleParser, type ParsedMail } from "mailparser";
import { io } from "../server.ts";

export async function startImapConnection() {
  await imapClient.connect();
  console.log("IMAP client connected");

  const lock = await imapClient.getMailboxLock("INBOX");
  console.log("Mailbox opened");

  console.log("fetching emails since last 30 days");
  const since = new Date();
  since.setDate(since.getDate() - 30);

  for await (const message of imapClient.fetch(
    { since },
    { envelope: true, source: true }
  )) {
    const raw = await message.source;
    const parsed: ParsedMail = await simpleParser(raw);

    const emailData = {
      subject: parsed.subject || "",
      from: parsed.from?.text || "",
      to: parsed.to?.text || "",
      date: parsed.date?.toISOString() || new Date().toISOString(),
      body: parsed.text || parsed.html || "",
      account: process.env.EMAIL_USER!,
      folder: "INBOX",
    };

    console.log("email fetched:", message.envelope?.subject);
    await storeEmailInEs(emailData);
  }

  imapClient.on("exists", async () => {
    console.log("new email arrived");

    if (!imapClient.mailbox) {
      console.log("mailbox not ready");
      return;
    }

    const messageCount = imapClient.mailbox.exists;

    const latest = await imapClient.fetchOne(messageCount, {
      envelope: true,
      source: true,
    });

    if (!latest) {
      console.log("failed to fetch latest email");
      return;
    }

    const envelope = latest.envelope;

    if (!envelope) {
      console.log("no envelope found for latest email");
      return;
    }

    const raw = await latest.source;

    if (!raw) {
      console.warn("⚠️ Skipped email — no raw content");
      return;
    }

    let parsed: ParsedMail;
    try {
      parsed = await simpleParser(raw);
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
      account: process.env.EMAIL_USER!,
      folder: "INBOX",
    };

    await storeEmailInEs(emailData);

    console.log("From:", envelope.from?.[0]?.address || "Unknown");
    console.log("Subject:", envelope.subject || "(No Subject)");
  });

  console.log("Listening for new emails...");
}
