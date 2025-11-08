import type { storeEmailProps } from "../types/index.ts";
import { categoriesByRule } from "./aiRules.ts";
import { esClient } from "./elasticsearch.ts";
import { sendSlackNotification } from "./slack.ts";

export async function storeEmailInEs(email: storeEmailProps) {
  try {
    let category = categoriesByRule(`${email.subject}\n${email.body}`);

    if (process.env.USE_LLM === "true") {
      try {
        const basic = email.body.trim() ? email.body : email.subject;
        category = await categoriesByRule(basic || "");
      } catch (e) {
        console.log("LLM categorization failed,", e);
      }
    }
    const res = await esClient.index({
      index: "emails",
      document: { ...email, category },
    });

    // trigger slack notification if category === interested
    if (category === "Interested") {
      await sendSlackNotification(
        `New Interested Lead! from ${
          email.from.match(/<(.*)>/)?.[1] || email.from
        } with subject: ${email.subject}`
      );
    }
    console.log("Stored email:", res.result, "category:", category);
  } catch (error) {
    console.error("Error storing email in Es:", error);
  }
}

export async function getEmailByIdFromES(id: string) {
  try {
    const response = await esClient.get({
      index: "emails",
      id,
    });

    if (!response.found) return null;

    return {
      id: response._id,
      ...(response._source as any),
    };
  } catch (err) {
    console.error("Elasticsearch get-by-id error:", err);
    return null;
  }
}
