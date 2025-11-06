import app from "./app.ts";
import { startImapConnection } from "./imap/index.ts";
import { createEmailIndex } from "./services/emailIndex.ts";

const PORT = process.env.PORT || 3000;

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  await createEmailIndex();
  await startImapConnection();
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
