import fs from "node:fs";
import path from "node:path";
import {
  clearKBIndex,
  ensureKBIndex,
  indexKBChunk,
  refreshKBIndex,
} from "../modules/ai/kb.repository.ts";
import { embedText } from "../modules/ai/rag.service.ts";

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

export async function seedKB(): Promise<void> {
  await ensureKBIndex();
  await clearKBIndex();

  if (!fs.existsSync(KB_DIR)) {
    console.warn(`Directory "${KB_DIR}" not found.`);
    return;
  }

  const files = fs.readdirSync(KB_DIR).filter((f) => f.endsWith(".txt"));
  if (files.length === 0) {
    console.warn("No files found in kb/ — add some .txt files first.");
    return;
  }

  for (const file of files) {
    const full = path.join(KB_DIR, file);
    const content = fs.readFileSync(full, "utf8");
    const title = path.basename(file, ".txt");

    const chunks = chunkText(content, 1000);
    console.log(`Seeding "${file}" as ${chunks.length} chunk(s)...`);

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);
      await indexKBChunk({
        title,
        content: chunk,
        embedding,
      });
    }
  }

  await refreshKBIndex();
  console.log("KB seeding complete.");
}

seedKB().catch((err) => {
  console.error("Failed to seed Knowledge Base:", err);
  process.exit(1);
});
