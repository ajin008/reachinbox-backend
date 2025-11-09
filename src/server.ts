import app from "./app.ts";
import { startImapConnection } from "./imap/index.ts";
import { createEmailIndex } from "./services/emailIndex.ts";
import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("websocket client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
  });
});

async function startServer() {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  await createEmailIndex();
  await startImapConnection();
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
