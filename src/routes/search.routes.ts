import { Router } from "express";
import { searchEmail } from "../services/emailSearch.ts";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ error: "query parameter 'q' is required" });
    }

    const result = await searchEmail(query);
    return res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
