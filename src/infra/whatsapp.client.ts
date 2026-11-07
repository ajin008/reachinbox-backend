import {
  DisconnectReason,
  makeWASocket,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { ENV } from "../config/env.ts";

let waSocket: WASocket | null = null;
let isWhatsAppReady = false;

export async function initWhatsAppClient(): Promise<void> {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(".whatsapp-auth");

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }) as any,
      printQRInTerminal: false,
    });

    waSocket = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\n==========================================");
        console.log("📱 Scan this QR Code in WhatsApp:");
        console.log("   (WhatsApp -> Settings -> Linked Devices -> Link a Device)");
        console.log("==========================================\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        isWhatsAppReady = true;
        console.log("✅ WhatsApp client connected and ready for notifications!");
      }

      if (connection === "close") {
        isWhatsAppReady = false;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          setTimeout(() => {
            initWhatsAppClient().catch((err) =>
              console.error("WhatsApp reconnect failed:", err)
            );
          }, 3000);
        } else {
          console.warn(
            "WhatsApp logged out. Delete '.whatsapp-auth' folder and restart to scan a new QR code."
          );
        }
      }
    });
  } catch (err) {
    console.error("Failed to initialize WhatsApp client:", err);
  }
}

function resolveTargetJid(): string | null {
  // 1. If WHATSAPP_TO_PHONE is explicitly set in .env, use that phone number
  if (ENV.whatsappToPhone) {
    const digits = ENV.whatsappToPhone.replace(/\D/g, "");
    if (digits) return `${digits}@s.whatsapp.net`;
  }

  // 2. Otherwise default to the linked user's own WhatsApp ("Message Yourself" chat)
  const rawUserId = waSocket?.user?.id;
  if (!rawUserId) return null;

  // Baileys user.id looks like "919876543210:14@s.whatsapp.net" -> strip ":device"
  const phonePart = rawUserId.split("@")[0]?.split(":")[0];
  return phonePart ? `${phonePart}@s.whatsapp.net` : null;
}

export async function sendWhatsAppNotification(message: string): Promise<void> {
  if (!waSocket || !isWhatsAppReady) {
    console.warn("WhatsApp client not connected yet. Skipping WhatsApp alert.");
    return;
  }

  const jid = resolveTargetJid();
  if (!jid) {
    console.warn("Could not determine WhatsApp recipient JID.");
    return;
  }

  try {
    await waSocket.sendMessage(jid, { text: message });
    console.log("📲 WhatsApp notification sent to:", jid);
  } catch (err) {
    console.error("WhatsApp notification failed:", err);
  }
}
