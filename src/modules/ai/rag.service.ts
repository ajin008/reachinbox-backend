import fs from "node:fs";
import path from "node:path";
import { ENV } from "../../config/env.ts";
import { openAi } from "../../infra/openai.client.ts";
import { buildRagReplyPrompt } from "./ai.prompts.ts";
import { searchKnowledgeBase } from "./kb.repository.ts";

export async function embedText(text: string): Promise<number[]> {
  const result = await openAi.embeddings.create({
    model: ENV.ollamaModel,
    input: text,
  });

  return result.data[0].embedding;
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
  const kbMatches = loadLocalKbFallback();
  const prompt = buildRagReplyPrompt(email.body, kbMatches);

  const response = await openAi.chat.completions.create({
    model: ENV.ollamaModel,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}
