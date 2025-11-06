import express from "express";
import searchRouter from "./routes/search.routes.ts";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/search", searchRouter);

export default app;
