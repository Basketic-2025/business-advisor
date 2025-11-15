import express from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import apiRouter from "./routes/index.js";
import "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const webDir = path.join(rootDir, "web");
const publicDir = path.join(rootDir, "public");
const testsDir = path.join(rootDir, "tests");

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use("/api", limiter);

app.use("/web", express.static(webDir));
app.use("/public", express.static(publicDir));
app.use("/tests", express.static(testsDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(webDir, "index.html"));
});

app.use("/api", apiRouter);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not Found" });
  }
  return next();
});

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  if (req.path.startsWith("/api")) {
    res.status(status).json({ error: message });
  } else {
    res.status(status).send(message);
  }
});

app.listen(port, () => {
  console.log(`AI Hustler server running on http://localhost:${port}`);
});
