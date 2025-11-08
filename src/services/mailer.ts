import nodemailer from "nodemailer";
import { ENV } from "../config/env.ts";

export const mailer = nodemailer.createTransport({
  host: ENV.smtp_host,
  port: Number(ENV.smtp_port || 587),
  secure: false,
  auth: {
    user: ENV.smtp_user,
    pass: ENV.smtp_pass,
  },
});

export async function sendReplayEmail(to: string, text: string) {
  try {
    // console.log("Sending email to:", to);

    await mailer.sendMail({
      from: ENV.smtp_user,
      to,
      subject: "Re: your mail",
      text,
    });

    // console.log("Auto-reply sent to:", to);
    return true;
  } catch (err: any) {
    console.error("❌ Failed to send email:", err.message, err);
    return false;
  }
}
