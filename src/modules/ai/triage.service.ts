import { ENV } from "../../config/env.ts";
import { openAi } from "../../infra/openai.client.ts";
import type { AICategories } from "../emails/email.types.ts";
import { buildTriagePrompt } from "./ai.prompts.ts";

const ALLOWED_CATEGORIES: AICategories[] = [
  "Interested",
  "Meeting Booked",
  "Not Interested",
  "Spam",
  "Out of Office",
  "General",
];

const TRIAGE_RULES: Array<{ category: AICategories; pattern: RegExp }> = [
  {
    category: "Out of Office",
    pattern:
      /\b(out of (the )?office|automatic reply|auto[- ]?reply|on vacation|away from my desk|currently away|ooo)\b/i,
  },
  {
    category: "Not Interested",
    pattern:
      /\b(not interested|uninterested|no thanks|no thank you|pass for now|not looking|take me off|stop emailing)\b/i,
  },
  {
    category: "Meeting Booked",
    pattern:
      /\b(calendly\.com|cal\.com|meet\.google\.com|zoom\.us|booked a (call|time|meeting)|meeting (is )?(booked|confirmed|scheduled)|schedule a (call|time|meeting|demo)|let'?s schedule)\b/i,
  },
  {
    category: "Interested",
    pattern:
      /\b(interested|keen|sounds good|let'?s (talk|chat|connect)|tell me more|send (me )?more info|would love to chat)\b/i,
  },
  {
    category: "Spam",
    pattern:
      /\b(unsubscribe|opt[- ]?out|remove me from|view in browser|special offer|limited time offer)\b/i,
  },
];

function cleanEmailTextForRules(raw: string): string {
  return (raw || "")
    // Strip quoted reply history ("On ... wrote:" and ">" quoted lines)
    .replace(/\r?\nOn .+wrote:[\s\S]*$/i, "")
    .replace(/^>.*$/gm, "")
    // Strip HTML style/script blocks and tags if HTML fallback was used
    .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyEmailByRule(text: string): AICategories {
  const cleaned = cleanEmailTextForRules(text);
  if (!cleaned) return "General";

  for (const rule of TRIAGE_RULES) {
    if (rule.pattern.test(cleaned)) {
      return rule.category;
    }
  }

  return "General";
}

export async function classifyEmailWithLlm(
  body: string
): Promise<AICategories> {
  const prompt = buildTriagePrompt(body, ALLOWED_CATEGORIES);
  const res = await openAi.chat.completions.create({
    model: ENV.ollamaModel,
    temperature: 0,
    max_tokens: 10,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = res.choices[0]?.message?.content?.trim() || "General";
  console.log(`Ollama (${ENV.ollamaModel}) raw category:`, raw);

  // Match longest/most-specific label first (so "Not Interested" matches before "Interested")
  const sortedAllowed = [...ALLOWED_CATEGORIES].sort(
    (a, b) => b.length - a.length
  );
  const match = sortedAllowed.find((item) =>
    raw.toLowerCase().includes(item.toLowerCase())
  );

  return match || "General";
}

export async function classifyEmailIntent(
  subject: string,
  body: string
): Promise<AICategories> {
  const combinedText = `Subject: ${subject}\n\n${body}`;
  let category = classifyEmailByRule(combinedText);

  if (ENV.useLlm) {
    try {
      const cleanedContent = cleanEmailTextForRules(combinedText);
      category = await classifyEmailWithLlm(cleanedContent || subject || "");
    } catch (err: any) {
      console.warn(
        "LLM categorization fallback to rules:",
        err?.code || err?.message || "OpenAI unavailable"
      );
    }
  }

  return category;
}
