import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalRateLimit } from "./middlewares/antiAbuse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  logger.warn("SESSION_SECRET not set — using insecure default. Set it in Railway environment variables.");
}

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["https://accounts.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.disable("x-powered-by");

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : (process.env.NODE_ENV === "production" ? false : true);

app.use(cors({
  credentials: true,
  origin: allowedOrigins,
}));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(session({
  secret: process.env.SESSION_SECRET || "slideo-dev-secret-change-in-prod",
  resave: false,
  saveUninitialized: false,
  name: "sid",
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
}));

app.use(globalRateLimit);
app.use("/api", router);

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../../../artifacts/slideo/dist/public");
  app.use(express.static(frontendPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

export default app;
