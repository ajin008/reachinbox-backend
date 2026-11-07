import type { AICategories } from "../emails/email.types.ts";

export function buildTriagePrompt(
  body: string,
  allowed: AICategories[]
): string {
  return `You are an email triage model. 
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
}

export function buildRagReplyPrompt(
  emailBody: string,
  kbDocs: Array<{ title: string; content: string }>
): string {
  const kbText = kbDocs.map((d) => `• ${d.title}\n${d.content}`).join("\n\n");

  return `
You are an AI assistant. Write a professional, concise reply email.

Incoming Email:
---------------
${emailBody}

Relevant Company Knowledge:
---------------------------
${kbText}

Your Task:
Write a helpful, polite reply. Do NOT hallucinate. Only use info above.
Don't invent product features or pricing not included in the KB.
Use short, clear sentences.
`;
}
