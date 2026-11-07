import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { ENV } from "../config/env.ts";

let ioInstance: Server | null = null;

export function initSocket(server: HttpServer): Server {
  ioInstance = new Server(server, {
    cors: {
      origin: ENV.frontendOrigins,
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected:", socket.id);
    });
  });

  return ioInstance;
}

export function emitNewEmail(payload: unknown): void {
  if (!ioInstance) return;
  ioInstance.emit("new-email", payload);
}
