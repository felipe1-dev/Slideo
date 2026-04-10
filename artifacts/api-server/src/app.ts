import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slude</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f0f11; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; }
    h1 { font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { color: #888; font-size: 1.1rem; margin-bottom: 2rem; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #fff; color: #0f0f11; border-radius: 8px; text-decoration: none; font-weight: 600; }
    a:hover { background: #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Slude</h1>
    <p>API is up and running</p>
    <a href="/api/healthz">Check API Health</a>
  </div>
</body>
</html>`);
});

app.use("/api", router);

export default app;
