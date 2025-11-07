import { AICategories } from "../types/index.ts";

export function getPrompt(body: string, allowed: AICategories[]): string {
  const prompt = `You are an email triage model. 
Return ONE of these labels exactly: ${allowed.join(", ")}.
Label rules:
- "Interested": they express interest or want to talk more.
- "Meeting Booked": they ask to schedule or share a booking link/time.
- "Not Interested": they decline or say not interested.
- "Spam": promotional/irrelevant or unsubscribe requests.
- "Out of Office": auto-reply vacation/OOO.
- "General": anything else.

Email:
"""${(body || "").slice(0, 4000)}"""
Return ONLY the label, nothing else.`;
  return prompt;
}
