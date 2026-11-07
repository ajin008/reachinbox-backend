import cors from "cors";
import express from "express";
import { ENV } from "./config/env.ts";
import emailRoutes from "./modules/emails/email.routes.ts";

const app = express();

app.use(
  cors({
    origin: ENV.frontendOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.use("/api", emailRoutes);

export default app;
