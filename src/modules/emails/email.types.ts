export type AICategories =
  | "Interested"
  | "Not Interested"
  | "Meeting Booked"
  | "Spam"
  | "Out of Office"
  | "General";

export interface StoreEmailInput {
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  account: string;
  folder: string;
}

export interface EmailDocument extends StoreEmailInput {
  category: AICategories;
}

export interface StoredEmail extends EmailDocument {
  id: string;
  score?: number;
}

export interface EmailFilterParams {
  account?: string;
  folder?: string;
  category?: string;
}
