import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, generationsTable } from "@workspace/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/profile", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    freeGenerationsUsed: user.freeGenerationsUsed,
    freeGenerationsLimit: user.freeGenerationsLimit,
    proGenerationsUsed: user.proGenerationsUsed,
    proGenerationsLimit: user.proGenerationsLimit,
    creditBalance: user.creditBalance,
    createdAt: user.createdAt,
  });
});

router.get("/usage", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [totalRow] = await db.select({ count: count() }).from(generationsTable).where(eq(generationsTable.userId, userId));
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [monthRow] = await db.select({ count: count() }).from(generationsTable).where(
    and(eq(generationsTable.userId, userId), gte(generationsTable.createdAt, startOfMonth))
  );
  const totalGenerations = totalRow?.count ?? 0;
  const generationsThisMonth = monthRow?.count ?? 0;
  let remainingGenerations = 0;
  if (user.plan === "pro") {
    remainingGenerations = Math.max(0, user.proGenerationsLimit - user.proGenerationsUsed) + user.creditBalance;
  } else {
    remainingGenerations = Math.max(0, user.freeGenerationsLimit - user.freeGenerationsUsed) + user.creditBalance;
  }
  res.json({
    totalGenerations,
    generationsThisMonth,
    remainingGenerations,
    plan: user.plan,
    creditBalance: user.creditBalance,
  });
});

export default router;
