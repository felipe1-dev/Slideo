import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurada");
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "Slideo <noreply@slideo.com.br>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const link = `${APP_URL}/verificar-email?token=${token}`;
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verifique seu e-mail — Slideo",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#0ea5e9;margin-bottom:8px">Slideo</h1>
        <h2 style="font-size:20px;margin-bottom:16px">Olá, ${name}! Confirme seu e-mail</h2>
        <p style="color:#555;margin-bottom:24px">
          Clique no botão abaixo para verificar seu e-mail e ativar sua conta.
          O link expira em <strong>24 horas</strong>.
        </p>
        <a href="${link}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
          Verificar meu e-mail
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          Se você não criou uma conta no Slideo, ignore este e-mail.
        </p>
        <p style="color:#bbb;font-size:11px">
          Link alternativo: <a href="${link}" style="color:#0ea5e9">${link}</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bem-vindo ao Slideo! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="color:#0ea5e9">Slideo</h1>
        <h2>Bem-vindo, ${name}!</h2>
        <p style="color:#555">Sua conta foi verificada com sucesso. Você já pode criar apresentações incríveis com IA!</p>
        <a href="${APP_URL}/gerar" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
          Criar minha primeira apresentação
        </a>
      </div>
    `,
  });
}
