import { openAi } from "../../config/openaiClient.ts";

export async function generateAIReply(email: string, kbDocs: any[]) {
  const kbText = kbDocs.map((d) => `• ${d.title}\n${d.content}`).join("\n\n");

  const prompt = `
You are an AI assistant. Write a professional, concise reply email.

Incoming Email:
---------------
${email}

Relevant Company Knowledge:
---------------------------
${kbText}

Your Task:
Write a helpful, polite reply. Do NOT hallucinate. Only use info above.
Don't invent product features or pricing not included in the KB.
Use short, clear sentences.
`;

  const response = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0].message.content;
}
