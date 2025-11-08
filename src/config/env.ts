import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  imapHost: process.env.IMAP_HOST || "imap.gmail.com",
  imapPort: Number(process.env.IMAP_PORT) || 993,
  openAi_api_key: process.env.OPENAI_API_KEY,
  Es_url: process.env.ELASTICSEARCH_URL,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  slack_webHook_url: process.env.SLACK_WEBHOOK_URL,
};
