import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PaymentModal from "@/components/PaymentModal";
import { api, type Generation } from "@/lib/api";
import { Sparkles, Presentation, History, CreditCard, ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [summary, setSummary] = useState<any>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; type: "pro_monthly" | "credits_50" }>({ open: false, type: "pro_monthly" });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      api.getDashboardSummary().then(setSummary).catch(() => {});
    }
  }, [user]);

  if (authLoading || !user) return null;

  const isPro = user.plan === "pro";
  const limit = isPro ? 200 : 5;
  const used = summary?.totalGenerations ?? 0;
  const remaining = summary?.remainingGenerations ?? 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Olá, {user.name?.split(" ")[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1">
              {isPro ? "Você tem acesso Pro ativo" : "Plano gratuito · 5 apresentações/mês"}
            </p>
          </div>
          <Link href="/gerar">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" /> Nova Apresentação
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Presentation className="h-4 w-4" /> Total Gerado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalGenerations ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">apresentações criadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Restantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{remaining}</div>
              <p className="text-xs text-muted-foreground mt-1">gerações disponíveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isPro ? "default" : "secondary"} className="text-sm px-3 py-0.5">
                {isPro ? "Pro" : "Free"}
              </Badge>
              {!isPro && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    <button onClick={() => setPayModal({ open: true, type: "pro_monthly" })} className="text-primary hover:underline">
                      Fazer upgrade →
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!isPro && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-semibold">Desbloqueie o plano Pro</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    200 apresentações/mês · Até 30 slides · IA premium
                  </p>
                </div>
                <Button onClick={() => setPayModal({ open: true, type: "pro_monthly" })} className="gap-2">
                  <CreditCard className="h-4 w-4" /> R$ 29/mês via PIX
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4" /> Recentes
            </h2>
            <Link href="/historico">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {!summary?.recentGenerations?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Presentation className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma apresentação ainda.</p>
                <Link href="/gerar">
                  <Button className="mt-4 gap-2">
                    <Sparkles className="h-4 w-4" /> Criar minha primeira
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.recentGenerations.map((g: Generation) => (
                <Link key={g.id} href={`/apresentacao/${g.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4 space-y-2">
                      <div className="h-24 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Presentation className="h-8 w-8 text-primary/50 group-hover:text-primary/70 transition-colors" />
                      </div>
                      <p className="font-medium text-sm line-clamp-2">{g.prompt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{g.slideCount} slides</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(g.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <PaymentModal
          open={payModal.open}
          onOpenChange={v => setPayModal(p => ({ ...p, open: v }))}
          type={payModal.type}
        />
      </div>
    </Layout>
  );
}
