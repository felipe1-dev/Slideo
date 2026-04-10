import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentModal from "@/components/PaymentModal";
import { Check, Sparkles, CreditCard, Zap } from "lucide-react";

const FREE_FEATURES = ["5 apresentações/mês", "Até 10 slides", "IA básica", "Histórico completo"];
const PRO_FEATURES = ["200 apresentações/mês", "Até 30 slides", "IA premium (GPT-4)", "Suporte prioritário", "Todos os estilos visuais"];
const CREDITS_FEATURES = ["50 gerações extras", "Não expiram nunca", "Qualquer plano", "Acumulam com mensalidade"];

export default function PricingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [payModal, setPayModal] = useState<{ open: boolean; type: "pro_monthly" | "credits_50" }>({ open: false, type: "pro_monthly" });

  const buyPro = () => {
    if (!user) { setLocation("/cadastro"); return; }
    setPayModal({ open: true, type: "pro_monthly" });
  };
  const buyCredits = () => {
    if (!user) { setLocation("/cadastro"); return; }
    setPayModal({ open: true, type: "credits_50" });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Planos e Preços</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pague com PIX e comece a usar em até 24 horas após confirmação do pagamento.
          </p>
          <Badge variant="secondary" className="text-xs">Sem assinatura automática · Renovação manual</Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative">
            <CardHeader className="pb-4">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle>Free</CardTitle>
              <div>
                <span className="text-3xl font-bold">R$ 0</span>
                <span className="text-muted-foreground text-sm"> /sempre</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {user?.plan === "free" ? (
                <Badge variant="secondary" className="w-full justify-center py-2">Plano atual</Badge>
              ) : (
                <Link href={user ? "/dashboard" : "/cadastro"}>
                  <Button variant="outline" className="w-full">
                    {user ? "Ir para painel" : "Começar grátis"}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="relative border-2 border-primary">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3">Mais popular</Badge>
            <CardHeader className="pb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="flex items-center gap-2">Pro <Badge className="text-xs">Recomendado</Badge></CardTitle>
              <div>
                <span className="text-3xl font-bold text-primary">R$ 29</span>
                <span className="text-muted-foreground text-sm"> /mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {user?.plan === "pro" ? (
                <Badge className="w-full justify-center py-2">Plano atual ✓</Badge>
              ) : (
                <Button className="w-full gap-2" onClick={buyPro}>
                  <CreditCard className="h-4 w-4" /> Assinar via PIX
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle>Créditos Extras</CardTitle>
              <div>
                <span className="text-3xl font-bold">R$ 15</span>
                <span className="text-muted-foreground text-sm"> /50 gerações</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {CREDITS_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full gap-2" onClick={buyCredits}>
                <CreditCard className="h-4 w-4" /> Comprar via PIX
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 rounded-xl bg-muted/50 border border-border space-y-3">
          <h3 className="font-semibold">Como funciona o pagamento?</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Clique no botão do plano desejado</li>
            <li>Informe seu nome completo para identificação</li>
            <li>Copie a chave PIX e faça a transferência</li>
            <li>Nossa equipe confirma em até <strong>24 horas</strong></li>
            <li>Seu plano é ativado automaticamente</li>
          </ol>
          <p className="text-xs text-muted-foreground pt-1">
            Pagamentos via PIX são seguros e instantâneos. Após o pagamento, guarde o comprovante.
          </p>
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
