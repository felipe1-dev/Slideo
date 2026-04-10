import app from "./app";
import { logger } from "./lib/logger";
import { initDb } from "@workspace/db";

const port = Number(process.env["PORT"] ?? "3000");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env["PORT"]}"`);
}

async function start() {
  try {
    await initDb();
  } catch (err) {
    logger.error({ err }, "Database initialization failed — server will still start");
  }

  app.listen(port, (err?: Error) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start();
