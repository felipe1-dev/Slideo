import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { usersTable, generationsTable } from "@workspace/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { requireEmailVerified, generateRateLimitStrict } from "../middlewares/antiAbuse";
import { getGeminiClient, getModel } from "../lib/aiClient";

const router: IRouter = Router();

const generateSchema = z.object({
  prompt: z.string().min(3).max(2000).transform(s => s.trim()),
  slideCount: z.number().int().min(3).max(30).optional().default(8),
  mode: z.enum(["traditional", "interactive"]).optional().default("traditional"),
  style: z.enum(["modern", "classic", "minimal", "colorful", "dark"]).optional().default("modern"),
  language: z.string().max(20).optional().default("pt-BR"),
});

function sanitizePrompt(str: string): string {
  return str.replace(/[<>"'`\\]/g, "").trim().slice(0, 2000);
}

function buildPrompt(prompt: string, slideCount: number, mode: string, style: string): string {
  return `Você é especialista em apresentações profissionais. Crie exatamente ${slideCount} slides sobre: "${prompt}".
Modo: ${mode === "interactive" ? "Interativo (inclua quiz/perguntas)" : "Tradicional"}
Estilo: ${style}

Retorne APENAS JSON válido, sem markdown:
{"slides":[{"slideNumber":1,"type":"title","title":"...","subtitle":"...","bullets":[],"notes":"...","layout":"centered"}]}

Tipos: title, content, section, interactive, quote, stats
Layouts: centered, split, two-column, grid
Para content: use bullets com 3-5 pontos. Para title: use type title e layout centered.
Para interactive: adicione interactiveElements:[{"type":"question","label":"...","options":["A","B","C"]}]`;
}

async function generateWithGemini(prompt: string, slideCount: number, mode: string, style: string): Promise<any[]> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: getModel() });
  const result = await model.generateContent(buildPrompt(prompt, slideCount, mode, style));
  const text = result.response.text();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Resposta inválida da IA");
  const parsed = JSON.parse(match[0]);
  return parsed.slides || [];
}

function fallbackSlides(prompt: string, slideCount: number): any[] {
  return Array.from({ length: slideCount }, (_, i) => ({
    slideNumber: i + 1,
    type: i === 0 ? "title" : "content",
    title: i === 0 ? prompt : `Ponto ${i}`,
    bullets: i > 0 ? ["Conteúdo indisponível — tente novamente"] : [],
    notes: "",
    layout: "centered",
  }));
}

async function checkAndDeductGenerations(user: any): Promise<boolean> {
  if (user.plan === "pro") {
    if (user.proGenerationsUsed < user.proGenerationsLimit) {
      await db.update(usersTable).set({ proGenerationsUsed: user.proGenerationsUsed + 1, lastGenerationAt: new Date() }).where(eq(usersTable.id, user.id));
      return true;
    }
  } else {
    if (user.freeGenerationsUsed < user.freeGenerationsLimit) {
      await db.update(usersTable).set({ freeGenerationsUsed: user.freeGenerationsUsed + 1, lastGenerationAt: new Date() }).where(eq(usersTable.id, user.id));
      return true;
    }
  }
  if (user.creditBalance > 0) {
    await db.update(usersTable).set({ creditBalance: user.creditBalance - 1, lastGenerationAt: new Date() }).where(eq(usersTable.id, user.id));
    return true;
  }
  return false;
}

router.post("/generate",
  requireAuth,
  requireEmailVerified,
  generateRateLimitStrict,
  async (req, res) => {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos. Prompt deve ter entre 3 e 2000 caracteres." });
      return;
    }

    const { prompt: rawPrompt, slideCount, mode, style } = parsed.data;
    const prompt = sanitizePrompt(rawPrompt);
    const userId = (req as any).userId;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    if (!user.emailVerified) {
      res.status(403).json({ error: "Verifique seu e-mail antes de gerar apresentações.", code: "EMAIL_NOT_VERIFIED" });
      return;
    }

    const maxSlides = user.plan === "pro" ? 30 : 10;
    const clampedCount = Math.min(Math.max(3, slideCount), maxSlides);

    if (user.plan === "free") {
      if (user.lastGenerationAt) {
        const minsSince = (Date.now() - new Date(user.lastGenerationAt).getTime()) / 60000;
        if (minsSince < 2) {
          res.status(429).json({ error: "Aguarde 2 minutos entre gerações no plano Free." });
          return;
        }
      }
    }

    const canGenerate = await checkAndDeductGenerations(user);
    if (!canGenerate) {
      res.status(429).json({
        error: "Limite de gerações atingido. Faça upgrade para Pro ou compre créditos.",
        code: "LIMIT_REACHED",
      });
      return;
    }

    let slides: any[] = [];
    try {
      slides = await generateWithGemini(prompt, clampedCount, mode, style);
    } catch (err) {
      console.error("Gemini error:", err);
      slides = fallbackSlides(prompt, clampedCount);
    }

    const [generation] = await db.insert(generationsTable).values({
      userId,
      prompt,
      mode,
      style,
      slideCount: slides.length,
      slides,
    }).returning();

    res.json({
      id: generation.id,
      prompt: generation.prompt,
      mode: generation.mode,
      style: generation.style,
      slideCount: generation.slideCount,
      slides: generation.slides,
      createdAt: generation.createdAt,
    });
  }
);

router.get("/history", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const [totalRow] = await db.select({ count: count() }).from(generationsTable).where(eq(generationsTable.userId, userId));
  const items = await db.select().from(generationsTable).where(eq(generationsTable.userId, userId)).orderBy(desc(generationsTable.createdAt)).limit(limit).offset(offset);
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.get("/dashboard-summary", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [totalRow] = await db.select({ count: count() }).from(generationsTable).where(eq(generationsTable.userId, userId));
  const recent = await db.select().from(generationsTable).where(eq(generationsTable.userId, userId)).orderBy(desc(generationsTable.createdAt)).limit(5);
  const remaining = user.plan === "pro"
    ? Math.max(0, user.proGenerationsLimit - user.proGenerationsUsed) + user.creditBalance
    : Math.max(0, user.freeGenerationsLimit - user.freeGenerationsUsed) + user.creditBalance;
  res.json({
    totalGenerations: totalRow?.count ?? 0,
    generationsThisMonth: 0,
    remainingGenerations: remaining,
    plan: user.plan,
    creditBalance: user.creditBalance,
    recentGenerations: recent,
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "ID inválido." }); return; }
  const [generation] = await db.select().from(generationsTable).where(eq(generationsTable.id, id)).limit(1);
  if (!generation || generation.userId !== userId) { res.status(404).json({ error: "Not found" }); return; }
  res.json(generation);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: "ID inválido." }); return; }
  const [generation] = await db.select().from(generationsTable).where(eq(generationsTable.id, id)).limit(1);
  if (!generation || generation.userId !== userId) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(generationsTable).where(eq(generationsTable.id, id));
  res.status(204).end();
});

export default router;
