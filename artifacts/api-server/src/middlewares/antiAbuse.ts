import { rateLimit } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, and, ne } from "drizzle-orm";

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: { error: "Muitas tentativas de login. Aguarde 15 minutos." },
});

export const generateRateLimitFree = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skip: (_req) => false,
  message: { error: "Limite de gerações por hora atingido. Aguarde ou faça upgrade para Pro." },
});

export const generateRateLimitStrict = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: { error: "Muitas requisições em curto tempo. Aguarde 1 minuto." },
});

export async function checkDuplicateAccount(
  ip: string,
  fingerprint: string | undefined,
  excludeUserId?: number
): Promise<{ blocked: boolean; reason: string }> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return { blocked: false, reason: "" };
  }

  const conditions = excludeUserId
    ? and(eq(usersTable.ipAddress, ip), ne(usersTable.id, excludeUserId))
    : eq(usersTable.ipAddress, ip);

  const existingByIp = await db
    .select({ id: usersTable.id, plan: usersTable.plan })
    .from(usersTable)
    .where(conditions)
    .limit(1);

  if (existingByIp.length > 0) {
    return { blocked: true, reason: "Já existe uma conta cadastrada com este endereço de IP." };
  }

  if (fingerprint) {
    const fpConditions = excludeUserId
      ? and(eq(usersTable.deviceFingerprint, fingerprint), ne(usersTable.id, excludeUserId))
      : eq(usersTable.deviceFingerprint, fingerprint);

    const existingByFp = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(fpConditions)
      .limit(1);

    if (existingByFp.length > 0) {
      return { blocked: true, reason: "Já existe uma conta cadastrada neste dispositivo." };
    }
  }

  return { blocked: false, reason: "" };
}

export function requireEmailVerified(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  if (!session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (session.emailVerified === false) {
    res.status(403).json({ error: "E-mail não verificado. Verifique seu e-mail antes de continuar.", code: "EMAIL_NOT_VERIFIED" });
    return;
  }
  next();
}
