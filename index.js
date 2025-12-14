import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import clientesRouter from "./routes/clientes.js";
import atendimentosRouter from "./routes/atendimentos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } catch {
    res.status(200).send("<!doctype html><html><head><meta charset='utf-8'><title>CRM</title></head><body><h1>CRM</h1></body></html>");
  }
});

app.get("/api/health", (req, res) => {
  try {
    res.json({ status: "ok" });
  } catch {
    res.json({ status: "ok" });
  }
});

app.use("/api", clientesRouter);
app.use("/api", atendimentosRouter);

export default app;

