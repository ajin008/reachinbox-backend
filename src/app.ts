import express from "express";
import emailRoutes from "./routes/email.routes.ts";
const app = express();
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api", emailRoutes);

export default app;
