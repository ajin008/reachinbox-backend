import nodemailer from "nodemailer";
import { ENV } from "../config/env.ts";

export const mailer = nodemailer.createTransport({
  host: ENV.smtp_host,
  port: ENV.smtp_port,
  secure: false,
  auth: {
    user: ENV.smtp_user,
    pass: ENV.smtp_pass,
  },
});

export async function sendReplyEmail(
  rawTo: string,
  originalSubject: string,
  text: string
): Promise<boolean> {
  try {
    const toAddress = rawTo.match(/<([^>]+)>/)?.[1]?.trim() || rawTo.trim();
    const cleanSubject = originalSubject?.trim()
      ? originalSubject.toLowerCase().startsWith("re:")
        ? originalSubject
        : `Re: ${originalSubject}`
      : "Re: your mail";

    await mailer.sendMail({
      from: ENV.smtp_user,
      to: toAddress,
      subject: cleanSubject,
      text,
    });

    return true;
  } catch (err: any) {
    console.error("Failed to send SMTP email:", err.message);
    return false;
  }
}
