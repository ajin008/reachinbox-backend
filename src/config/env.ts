import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  imapHost: process.env.IMAP_HOST || "imap.gmail.com",
  imapPort: Number(process.env.IMAP_PORT) || 993,
};
