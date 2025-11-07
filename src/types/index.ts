export interface storeEmailProps {
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  account: string;
  folder: string;
}

export interface EmailDocument {
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  account: string;
  folder: string;
  category: string;
}

export type AICategories =
  | "Interested"
  | "Not Interested"
  | "Meeting Booked"
  | "Spam"
  | "Out of Office"
  | "General";
