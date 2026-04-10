import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { paymentsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const PRICING: Record<string, number> = {
  pro_monthly: 2900,
  credits_50: 1500,
};

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return false; }
  const [user] = await db.select({ isAdmin: usersTable.isAdmin }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user?.isAdmin) { res.status(403).json({ error: "Proibido" }); return false; }
  return true;
}

const createPaymentSchema = z.object({
  payerName: z.string().min(2).max(150).transform(s => s.replace(/[<>"'`]/g, "").trim()),
  type: z.enum(["pro_monthly", "credits_50"]),
});

router.get("/pix-key", requireAuth, (_req, res) => {
  const pixKey = process.env.PIX_KEY || "Configure PIX_KEY no painel";
  res.json({ pixKey });
});

router.post("/create", requireAuth, async (req, res) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { payerName, type } = parsed.data;
  const userId = (req as any).userId;
  const amountCents = PRICING[type];

  const [payment] = await db.insert(paymentsTable).values({
    userId,
    payerName,
    type,
    amountCents,
    status: "pending",
  }).returning();

  const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const pixKey = process.env.PIX_KEY || "Configure PIX_KEY no painel";

  res.json({
    payment: {
      ...payment,
      userName: user?.name || "",
      userEmail: user?.email || "",
    },
    pixKey,
  });
});

router.get("/my", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const items = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, userId)).orderBy(desc(paymentsTable.createdAt));
  const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({
    items: items.map(p => ({ ...p, userName: user?.name || "", userEmail: user?.email || "" })),
    total: items.length,
  });
});

router.get("/admin/all", requireAuth, async (req, res) => {
  if (!await requireAdmin(req, res)) return;

  const statusFilter = req.query.status as string;
  let payments = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));
  if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
    payments = payments.filter(p => p.status === statusFilter);
  }

  const userIds = [...new Set(payments.map(p => p.userId))];
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email }).from(usersTable)
    : [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  res.json({
    items: payments.map(p => ({
      ...p,
      userName: userMap[p.userId]?.name || "",
      userEmail: userMap[p.userId]?.email || "",
    })),
    total: payments.length,
  });
});

router.post("/admin/:id/approve", requireAuth, async (req, res) => {
  if (!await requireAdmin(req, res)) return;

  const paymentId = Number(req.params.id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) { res.status(400).json({ error: "ID inválido" }); return; }

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, paymentId)).limit(1);
  if (!payment) { res.status(404).json({ error: "Pagamento não encontrado" }); return; }
  if (payment.status !== "pending") { res.status(400).json({ error: "Pagamento já processado" }); return; }

  await db.update(paymentsTable).set({ status: "approved", updatedAt: new Date() }).where(eq(paymentsTable.id, paymentId));

  if (payment.type === "pro_monthly") {
    await db.update(usersTable).set({ plan: "pro", proGenerationsUsed: 0 }).where(eq(usersTable.id, payment.userId));
  } else if (payment.type === "credits_50") {
    const [target] = await db.select({ creditBalance: usersTable.creditBalance }).from(usersTable).where(eq(usersTable.id, payment.userId)).limit(1);
    if (target) {
      await db.update(usersTable).set({ creditBalance: target.creditBalance + 50 }).where(eq(usersTable.id, payment.userId));
    }
  }

  res.json({ message: "Pagamento aprovado com sucesso" });
});

router.post("/admin/:id/reject", requireAuth, async (req, res) => {
  if (!await requireAdmin(req, res)) return;

  const paymentId = Number(req.params.id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) { res.status(400).json({ error: "ID inválido" }); return; }

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, paymentId)).limit(1);
  if (!payment) { res.status(404).json({ error: "Pagamento não encontrado" }); return; }
  if (payment.status !== "pending") { res.status(400).json({ error: "Pagamento já processado" }); return; }

  await db.update(paymentsTable).set({ status: "rejected", updatedAt: new Date() }).where(eq(paymentsTable.id, paymentId));
  res.json({ message: "Pagamento rejeitado" });
});

export default router;
