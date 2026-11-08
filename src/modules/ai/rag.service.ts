import fs from "node:fs";
import path from "node:path";
import { ENV } from "../../config/env.ts";
import { openAi } from "../../infra/openai.client.ts";
import { buildRagReplyPrompt } from "./ai.prompts.ts";
import { searchKnowledgeBase } from "./kb.repository.ts";

function buildLocalEmbedding(text: string, dims = 768): number[] {
  const vec = new Array<number>(dims).fill(0);
  const tokens = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const idx = Math.abs(hash) % dims;
    vec[idx] += 1;
  }

  const norm = Math.hypot(...vec) || 1;
  return vec.map((v) => v / norm);
}

export async function embedText(text: string): Promise<number[]> {
  try {
    const result = await openAi.embeddings.create({
      model: ENV.ollamaModel,
      input: text,
    });

    const raw = result.data[0].embedding;
    return raw.length > 768 ? raw.slice(0, 768) : raw;
  } catch {
    return buildLocalEmbedding(text, 768);
  }
}

function loadLocalKbFallback(): Array<{ title: string; content: string }> {
  try {
    const kbDir = path.join(process.cwd(), "kb");
    if (!fs.existsSync(kbDir)) return [];
    return fs
      .readdirSync(kbDir)
      .filter((file) => file.endsWith(".txt"))
      .map((file) => ({
        title: path.basename(file, ".txt"),
        content: fs.readFileSync(path.join(kbDir, file), "utf8").trim(),
      }));
  } catch {
    return [];
  }
}

export async function generateGroundedReply(email: {
  subject: string;
  from: string;
  body: string;
}): Promise<string> {
  let kbMatches: Array<{ title: string; content: string }> = [];
  try {
    const embedding = await embedText(
      `${email.subject}\n${email.from}\n${email.body}`
    );
    kbMatches = await searchKnowledgeBase(embedding, 3);
  } catch {
    // Fallback if KB embeddings index is not seeded yet
  }

  if (kbMatches.length === 0) {
    kbMatches = loadLocalKbFallback();
  }

  const prompt = buildRagReplyPrompt(email.body, kbMatches);

  const response = await openAi.chat.completions.create({
    model: ENV.ollamaModel,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}
