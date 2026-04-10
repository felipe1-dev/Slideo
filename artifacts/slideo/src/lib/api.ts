const BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; fingerprint?: string }) => req("POST", "/auth/register", body),
  login: (body: { email: string; password: string }) => req("POST", "/auth/login", body),
  googleAuth: (body: { credential: string; fingerprint?: string }) => req("POST", "/auth/google", body),
  getMe: () => req("GET", "/auth/me"),
  verifyEmail: (token: string) => req("GET", `/auth/verify-email?token=${token}`),
  resendVerification: () => req("POST", "/auth/resend-verification"),
  logout: () => req("POST", "/auth/logout"),

  // User
  getProfile: () => req("GET", "/user/profile"),
  getUsage: () => req("GET", "/user/usage"),

  // Slides
  generateSlides: (body: {
    prompt: string;
    slideCount?: number;
    mode?: string;
    style?: string;
    language?: string;
  }) => req("POST", "/slides/generate", body),
  getHistory: (limit = 20, offset = 0) => req("GET", `/slides/history?limit=${limit}&offset=${offset}`),
  getDashboardSummary: () => req("GET", "/slides/dashboard-summary"),
  getSlide: (id: number) => req("GET", `/slides/${id}`),
  deleteSlide: (id: number) => req("DELETE", `/slides/${id}`),

  // Payments
  getPixKey: () => req("GET", "/payments/pix-key"),
  createPayment: (body: { payerName: string; type: string }) => req("POST", "/payments/create", body),
  getMyPayments: () => req("GET", "/payments/my"),
  adminGetPayments: (status?: string) => req("GET", `/payments/admin/all${status ? `?status=${status}` : ""}`),
  adminApprovePayment: (id: number) => req("POST", `/payments/admin/${id}/approve`),
  adminRejectPayment: (id: number) => req("POST", `/payments/admin/${id}/reject`),
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  plan: "free" | "pro";
  isAdmin?: boolean;
  avatarUrl?: string;
  emailVerified?: boolean;
};

export type SlideContent = {
  slideNumber: number;
  type: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  notes?: string;
  layout?: string;
  interactiveElements?: { type: string; label: string; options?: string[] }[];
};

export type Generation = {
  id: number;
  prompt: string;
  mode: string;
  style: string;
  slideCount: number;
  slides: SlideContent[];
  createdAt: string;
};

export type Payment = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  payerName: string;
  type: "pro_monthly" | "credits_50";
  amountCents: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};
