import axios from "axios";
import { ENV } from "../config/env.ts";

export async function sendSlackNotification(message: string) {
  console.log("slack url:");
  if (!ENV.slack_webHook_url) {
    console.warn("SLACK_WEBHOOK_URL not set. skipping slack notification.");
    return;
  }
  try {
    await axios.post(ENV.slack_webHook_url, {
      text: message,
    });
  } catch (err) {
    console.error("❌ Slack notification failed:", err);
  }
}
