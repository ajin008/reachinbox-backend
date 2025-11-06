import type { storeEmailProps } from "../types/index.ts";
import { esClient } from "./elasticsearch.ts";

export async function storeEmailInEs(email: storeEmailProps) {
  try {
    const res = await esClient.index({
      index: "emails",
      document: email,
    });
    console.log("stored email in Es:", res.result);
  } catch (error) {
    console.error("Error storing email in Es:", error);
  }
}
