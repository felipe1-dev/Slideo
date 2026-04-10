import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { authRateLimit, getClientIp, checkDuplicateAccount } from "../middlewares/antiAbuse";
import { sendVerificationEmail, sendWelcomeEmail } from "../lib/email";

const router: IRouter = Router();

function sanitizeText(str: string): string {
  return str.replace(/[<>"'`]/g, "").trim().slice(0, 200);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function verifyGoogleToken(credential: string): Promise<{ email: string; name: string; sub: string; picture?: string } | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload.email_verified || payload.email_verified === "false") return null;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) return null;
    return {
      email: payload.email,
      name: payload.name || payload.email,
      sub: payload.sub,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  fingerprint: z.string().max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

router.post("/register", authRateLimit, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos. Nome mínimo 2 caracteres, senha mínima de 8 caracteres." });
    return;
  }

  const { name, email, password, fingerprint } = parsed.data;
  const cleanName = sanitizeText(name);
  const cleanEmail = email.toLowerCase().trim();
  const ip = getClientIp(req);

  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, cleanEmail)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "E-mail já cadastrado." });
    return;
  }

  const dupCheck = await checkDuplicateAccount(ip, fingerprint);
  if (dupCheck.blocked) {
    res.status(403).json({ error: dupCheck.reason });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = adminEmail ? cleanEmail === adminEmail.toLowerCase() : false;
  const verifyToken = generateToken();
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [user] = await db.insert(usersTable).values({
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    isAdmin,
    emailVerified: isAdmin,
    emailVerifyToken: isAdmin ? null : verifyToken,
    emailVerifyExpires: isAdmin ? null : verifyExpires,
    ipAddress: ip,
    deviceFingerprint: fingerprint || null,
    plan: "free",
    freeGenerationsUsed: 0,
    freeGenerationsLimit: 5,
    proGenerationsUsed: 0,
    proGenerationsLimit: 200,
    creditBalance: 0,
  }).returning();

  (req as any).session.userId = user.id;
  (req as any).session.emailVerified = user.emailVerified;

  if (!isAdmin) {
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (e) {
      console.error("Email send error:", e);
    }
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, plan: user.plan, isAdmin: user.isAdmin, emailVerified: user.emailVerified },
    message: isAdmin ? "Conta criada com sucesso!" : "Conta criada! Verifique seu e-mail para ativar a conta.",
  });
});

router.post("/login", authRateLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos." });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

  const dummyHash = "$2b$12$invalidhashtopreventtimingattacks.xxxxxxxxxxxxxxxxxx";
  const valid = user?.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : (await bcrypt.compare(password, dummyHash), false);

  if (!user || !valid) {
    res.status(401).json({ error: "E-mail ou senha inválidos." });
    return;
  }

  (req as any).session.userId = user.id;
  (req as any).session.emailVerified = user.emailVerified;
  res.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan, isAdmin: user.isAdmin, emailVerified: user.emailVerified, avatarUrl: user.avatarUrl } });
});

router.post("/google", authRateLimit, async (req, res) => {
  const credential = typeof req.body?.credential === "string" ? req.body.credential : null;
  const fingerprint = typeof req.body?.fingerprint === "string" ? req.body.fingerprint.slice(0, 200) : undefined;

  if (!credential) { res.status(400).json({ error: "Token inválido." }); return; }

  const payload = await verifyGoogleToken(credential);
  if (!payload) { res.status(401).json({ error: "Token Google inválido ou expirado." }); return; }

  const { email, name, sub: googleId, picture } = payload;
  const ip = getClientIp(req);

  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = adminEmail ? email.toLowerCase() === adminEmail.toLowerCase() : false;

  if (!user) {
    const dupCheck = await checkDuplicateAccount(ip, fingerprint);
    if (dupCheck.blocked) {
      res.status(403).json({ error: dupCheck.reason });
      return;
    }
    [user] = await db.insert(usersTable).values({
      name: sanitizeText(name || email),
      email: email.toLowerCase(),
      googleId,
      avatarUrl: picture,
      isAdmin,
      emailVerified: true,
      ipAddress: ip,
      deviceFingerprint: fingerprint || null,
      plan: "free",
      freeGenerationsUsed: 0,
      freeGenerationsLimit: 5,
      proGenerationsUsed: 0,
      proGenerationsLimit: 200,
      creditBalance: 0,
    }).returning();
  } else {
    await db.update(usersTable).set({ googleId, avatarUrl: picture, emailVerified: true }).where(eq(usersTable.id, user.id));
    user.avatarUrl = picture;
    user.emailVerified = true;
  }

  (req as any).session.userId = user.id;
  (req as any).session.emailVerified = user.emailVerified;
  res.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan, isAdmin: user.isAdmin, emailVerified: user.emailVerified, avatarUrl: user.avatarUrl } });
});

router.get("/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    (req as any).session.destroy(() => {});
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).session.emailVerified = user.emailVerified;
  res.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan, isAdmin: user.isAdmin, emailVerified: user.emailVerified, avatarUrl: user.avatarUrl } });
});

router.post("/logout", (req, res) => {
  (req as any).session.destroy(() => {});
  res.clearCookie("sid");
  res.json({ message: "Saiu com sucesso." });
});

router.get("/verify-email", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : null;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    res.status(400).json({ error: "Token inválido." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.emailVerifyToken, token)).limit(1);
  if (!user) {
    res.status(400).json({ error: "Token inválido ou expirado." });
    return;
  }
  if (user.emailVerifyExpires && new Date() > user.emailVerifyExpires) {
    res.status(400).json({ error: "Token expirado. Solicite um novo e-mail de verificação." });
    return;
  }

  await db.update(usersTable).set({ emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null }).where(eq(usersTable.id, user.id));
  if ((req as any).session?.userId === user.id) {
    (req as any).session.emailVerified = true;
  }
  try { await sendWelcomeEmail(user.email, user.name); } catch {}
  res.json({ message: "E-mail verificado com sucesso! Bem-vindo ao Slideo." });
});

router.post("/resend-verification", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Usuário não encontrado." }); return; }
  if (user.emailVerified) { res.status(400).json({ error: "E-mail já verificado." }); return; }

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.update(usersTable).set({ emailVerifyToken: token, emailVerifyExpires: expires }).where(eq(usersTable.id, userId));
  try {
    await sendVerificationEmail(user.email, user.name, token);
    res.json({ message: "E-mail de verificação reenviado." });
  } catch {
    res.status(500).json({ error: "Erro ao enviar e-mail. Tente novamente." });
  }
});

export default router;
