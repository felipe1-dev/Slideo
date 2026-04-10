import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentModal from "@/components/PaymentModal";
import { api, type Payment } from "@/lib/api";
import { CreditCard, Clock, CheckCircle, XCircle, Loader2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 gap-1"><CheckCircle className="h-3 w-3" /> Aprovado</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeitado</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Aguardando</Badge>;
}

function typeLabel(type: string) {
  return type === "pro_monthly" ? "Pro Mensal · R$ 29,00" : "50 Créditos · R$ 15,00";
}

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<{ open: boolean; type: "pro_monthly" | "credits_50" }>({ open: false, type: "pro_monthly" });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading]);

  const loadPayments = () => {
    if (user) {
      api.getMyPayments().then((data: any) => {
        setItems(data.items);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  };

  useEffect(() => { loadPayments(); }, [user]);

  if (authLoading || !user) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meus Pagamentos</h1>
            <p className="text-muted-foreground mt-1">Histórico de pagamentos via PIX</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPayModal({ open: true, type: "credits_50" })}>
              <Plus className="h-4 w-4" /> Créditos
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setPayModal({ open: true, type: "pro_monthly" })}>
              <CreditCard className="h-4 w-4" /> Assinar Pro
            </Button>
          </div>
        </div>

        {user.plan === "pro" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">Plano Pro ativo</p>
                <p className="text-xs text-muted-foreground">200 apresentações/mês com IA premium</p>
              </div>
              <Badge className="ml-auto">Pro</Badge>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pagamento realizado.</p>
              <Button className="mt-4 gap-2" onClick={() => setPayModal({ open: true, type: "pro_monthly" })}>
                <CreditCard className="h-4 w-4" /> Assinar Pro por R$ 29/mês
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{typeLabel(p.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.payerName} · {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center p-4 rounded-lg bg-muted/30">
          Pagamentos aprovados em até 24 horas úteis. Dúvidas? Entre em contato.
        </div>

        <PaymentModal
          open={payModal.open}
          onOpenChange={v => { setPayModal(p => ({ ...p, open: v })); if (!v) loadPayments(); }}
          type={payModal.type}
        />
      </div>
    </Layout>
  );
}
