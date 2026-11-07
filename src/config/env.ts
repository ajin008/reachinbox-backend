import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  port: Number(process.env.PORT) || 5000,
  frontendOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  imapHost: process.env.IMAP_HOST || "imap.gmail.com",
  imapPort: Number(process.env.IMAP_PORT) || 993,
  openAi_api_key: process.env.OPENAI_API_KEY || "",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2",
  useLlm: process.env.USE_LLM === "true",
  Es_url: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  smtp_host: process.env.SMTP_HOST || "",
  smtp_port: Number(process.env.SMTP_PORT) || 587,
  smtp_user: process.env.SMTP_USER || "",
  smtp_pass: process.env.SMTP_PASS || "",
  slack_webHook_url: process.env.SLACK_WEBHOOK_URL || "",
  whatsappToPhone: process.env.WHATSAPP_TO_PHONE || "",
};
