import axios from "axios";

export async function sendSlackNotification(message: string) {
  console.log("slack url:");
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not set. skipping slack notification.");
    return;
  }
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: message,
    });
  } catch (err) {
    console.error("❌ Slack notification failed:", err);
  }
}
