declare module "mailparser" {
  export function simpleParser(source: any): Promise<ParsedMail>;

  export interface ParsedMail {
    subject: string;
    from?: { text: string };
    to?: { text: string };
    date?: Date;
    text?: string;
    html?: string;
  }
}
