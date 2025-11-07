import { openAi } from "../config/openaiClient.ts";
import { AICategories } from "../types/index.ts";
import { getPrompt } from "../utils/prompt.ts";

export async function categoriesEmailWithAi(
  body: string
): Promise<AICategories> {
  const allowed: AICategories[] = [
    "Interested",
    "Meeting Booked",
    "Not Interested",
    "Spam",
    "Out of Office",
    "General",
  ];
  const prompt = getPrompt(body, allowed);
  const res = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 10,
    messages: [{ role: "user", content: prompt }],
  });
  const raw = res.choices[0]?.message?.content?.trim() || "General";
  console.log("LLM raw category:", raw);
  const match = allowed.find((item) =>
    raw.toLowerCase().includes(item.toLowerCase())
  );
  return match || "General";
}
