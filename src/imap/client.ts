import { ImapFlow } from "imapflow";
import { ENV } from "../config/env.ts";

export const imapClient = new ImapFlow({
  host: ENV.imapHost,
  port: ENV.imapPort,
  secure: true,
  auth: {
    user: ENV.emailUser,
    pass: ENV.emailPass,
  },
  logger: false,
});
