import { Router } from "express";
import {
  filterEmails,
  getAllMail,
  getCurrentAccount,
  getEmailById,
  mailSearch,
  sendAiReplay,
} from "./email.controller.ts";

const router = Router();

router.get("/emails", getAllMail);
// Register /emails/filter BEFORE /emails/:id so "filter" isn't captured as :id
router.get("/emails/filter", filterEmails);
router.get("/emails/:id", getEmailById);

router.get("/search", mailSearch);
router.get("/account", getCurrentAccount);
router.post("/ai-replay", sendAiReplay);

export default router;
