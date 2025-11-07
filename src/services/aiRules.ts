import type { AICategories } from "../types/index.ts";

export function categoriesByRule(text: string): AICategories {
  const t = (text || "").toLowerCase();
  if (t.includes("interested") || t.includes("keen")) return "Interested";
  if (t.includes("schedule") || t.includes("book") || t.includes("calendar"))
    return "Meeting Booked";
  if (t.includes("not interested") || t.includes("no thanks"))
    return "Not Interested";
  if (
    t.includes("out of office") ||
    t.includes("ooo") ||
    t.includes("vacation")
  )
    return "Out of Office";
  if (t.includes("unsubscribe") || t.includes("remove me")) return "Spam";
  return "General";
}
