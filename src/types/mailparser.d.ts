declare module "mailparser" {
  export function simpleParser(source: any): Promise<ParsedMail>;

  export interface ParsedMail {
    messageId?: string;
    subject: string;
    from?: { text: string };
    to?: { text: string };
    date?: Date;
    text?: string;
    html?: string;
  }
}

declare module "qrcode-terminal" {
  export function generate(
    text: string,
    options?: { small?: boolean },
    callback?: (qrcode: string) => void
  ): void;
}
