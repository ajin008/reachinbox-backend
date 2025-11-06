import { storeEmailInEs } from "../services/emailStore.ts";
import { imapClient } from "./client.ts";

export async function startImapConnection() {
  await imapClient.connect();
  console.log("IMAP client connected");

  const lock = await imapClient.getMailboxLock("INBOX");
  console.log("Mailbox opened");

  console.log("fetching emails since last 30 days");
  const since = new Date();
  since.setDate(since.getDate() - 30);

  for await (const message of imapClient.fetch({ since }, { envelope: true })) {
    const emailData = {
      subject: message.envelope?.subject || "",
      from: message.envelope?.from?.[0]?.address || "",
      to: message.envelope?.to?.[0]?.address || "",
      date: message.envelope?.date
        ? new Date(message.envelope.date).toISOString()
        : new Date().toISOString(),
      body: "",
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

    const emailData = {
      subject: latest.envelope?.subject || "",
      from: latest.envelope?.from?.[0]?.address || "",
      to: latest.envelope?.to?.[0]?.address || "",
      date: latest.envelope?.date
        ? new Date(latest.envelope.date).toISOString()
        : new Date().toISOString(),
      body: "",
      account: process.env.EMAIL_USER!,
      folder: "INBOX",
    };

    await storeEmailInEs(emailData);
    console.log("From:", envelope.from?.[0]?.address || "Unknown");
    console.log("Subject:", envelope.subject || "(No Subject)");
  });

  console.log("Listening for new emails...");
}
