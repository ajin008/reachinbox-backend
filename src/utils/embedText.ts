import { openAi } from "../config/openaiClient.ts";

export async function embedText(text: string) {
  try {
    // console.log("embed text is triggering");

    const result = await openAi.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    // console.log("embed function result", result);

    return result.data[0].embedding;
  } catch (err: any) {
    console.error("EMBEDDING ERROR:", err.message, err);
    throw err;
  }
}
