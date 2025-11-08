import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { esClient } from "../services/elasticsearch.ts";
import { ensureKBIndex } from "./kbIndex.ts";

const openai = new OpenAI({
  apiKey:
    "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",
});

const KB_DIR = path.join(process.cwd(), "kb");

function chunkText(text: string, maxChars = 1000): string[] {
  const paras = text.split(/\n\s*\n/);
  const chunks: string[] = [];

  let buf = "";

  for (const p of paras) {
    if ((buf + "\n\n" + p).length > maxChars) {
      if (buf.trim()) chunks.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export async function seedKB() {
  await ensureKBIndex();

  const files = fs.readdirSync(KB_DIR).filter((f) => f.endsWith(".txt"));
  if (files.length === 0) {
    console.warn("No files found in kb/ — add some .txt files first.");
    return;
  }

  for (let file of files) {
    const full = path.join(KB_DIR, file);
    const content = fs.readFileSync(full, "utf8");
    const title = path.basename(file, ".txt");

    const chunks = chunkText(content, 1000);
    console.log(`Seeding "${file}" as ${chunks.length} chunk(s)...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const { data } = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      const vector = data[0].embedding;

      await esClient.index({
        index: "kb_docs",
        document: {
          title,
          content: chunk,
          created_at: new Date().toISOString(),
          embedding: vector,
        },
      });
    }

    await esClient.indices.refresh({ index: "kb_docs" });
    console.log("KB seeding complete");
  }
}
