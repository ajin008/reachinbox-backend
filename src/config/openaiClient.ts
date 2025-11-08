import OpenAI from "openai";
import { ENV } from "./env.ts";

export const openAi = new OpenAI({
  apiKey: ENV.openAi_api_key,
});
