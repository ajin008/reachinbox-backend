import http from "node:http";
import app from "./app.ts";
import { ENV } from "./config/env.ts";
import { initSocket } from "./infra/socket.ts";
import { initWhatsAppClient } from "./infra/whatsapp.client.ts";
import { ensureKBIndex } from "./modules/ai/kb.repository.ts";
import { startImapWorker } from "./modules/emails/email.imap.worker.ts";
import { ensureEmailIndex } from "./modules/emails/email.repository.ts";

const server = http.createServer(app);
initSocket(server);

async function startServer() {
  server.listen(ENV.port, () => {
    console.log(`Server running on http://localhost:${ENV.port}`);
  });

  await ensureEmailIndex();
  await ensureKBIndex();
  await initWhatsAppClient();
  await startImapWorker();
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
