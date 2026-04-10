import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type Payment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, X, Loader2, Clock, Users, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function typeLabel(type: string) {
  return type === "pro_monthly" ? "Pro Mensal · R$29" : "50 Créditos · R$15";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Aprovado</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejeitado</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) setLocation("/dashboard");
  }, [user, authLoading]);

  const loadPayments = (status?: string) => {
    setLoading(true);
    api.adminGetPayments(status).then((data: any) => {
      setPayments(data.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.isAdmin) loadPayments(tab === "all" ? undefined : tab);
  }, [user, tab]);

  const approve = async (id: number) => {
    setProcessing(id);
    try {
      await api.adminApprovePayment(id);
      toast({ title: "Pagamento aprovado!", description: "O plano do usuário foi atualizado." });
      loadPayments(tab === "all" ? undefined : tab);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const reject = async (id: number) => {
    setProcessing(id);
    try {
      await api.adminRejectPayment(id);
      toast({ title: "Pagamento rejeitado" });
      loadPayments(tab === "all" ? undefined : tab);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  if (authLoading || !user?.isAdmin) return null;

  const pending = payments.filter(p => p.status === "pending");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground text-sm">Gerenciar pagamentos PIX</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-500">{pending.length}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> Pendentes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <CreditCard className="h-3 w-3" /> Total
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {payments.filter(p => p.status === "approved").length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Check className="h-3 w-3" /> Aprovados
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">Pendentes {pending.length > 0 && `(${pending.length})`}</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : payments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum pagamento encontrado.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <Card key={p.id} className={p.status === "pending" ? "border-yellow-500/30 bg-yellow-500/5" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{p.payerName}</span>
                            <StatusBadge status={p.status} />
                          </div>
                          <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                          <p className="text-sm font-medium text-primary">{typeLabel(p.type)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        {p.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-destructive hover:text-destructive border-destructive/30"
                              onClick={() => reject(p.id)}
                              disabled={processing === p.id}
                            >
                              {processing === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                              Rejeitar
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1.5 bg-green-600 hover:bg-green-700"
                              onClick={() => approve(p.id)}
                              disabled={processing === p.id}
                            >
                              {processing === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              Aprovar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
