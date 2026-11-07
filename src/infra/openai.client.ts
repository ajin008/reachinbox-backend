import OpenAI from "openai";
import { ENV } from "../config/env.ts";

export const openAi = new OpenAI({
  baseURL: ENV.ollamaBaseUrl,
  apiKey: ENV.ollamaBaseUrl ? "ollama" : ENV.openAi_api_key,
});
