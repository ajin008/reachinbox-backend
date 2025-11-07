import { Router } from "express";
import {
  filterEmails,
  getAllMail,
  getCurrentAccount,
  getEmailById,
} from "../controllers/email.controller.ts";
import { mailSearch } from "../controllers/search.controller.ts";

const router = Router();

router.get("/emails", getAllMail);
router.get("/emails/:id", getEmailById);
router.get("/emails/filter", filterEmails);
router.get("/search", mailSearch);

router.get("/account", getCurrentAccount);

export default router;
