import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Loader2, CheckCircle2 } from "lucide-react";

type PaymentType = "pro_monthly" | "credits_50";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: PaymentType;
}

const PLANS: Record<PaymentType, { label: string; price: string; desc: string }> = {
  pro_monthly: { label: "Pro Mensal", price: "R$ 29,00", desc: "200 apresentações/mês · até 30 slides · IA premium" },
  credits_50: { label: "50 Créditos", price: "R$ 15,00", desc: "50 gerações extras · não expiram · qualquer plano" },
};

export default function PaymentModal({ open, onOpenChange, type }: PaymentModalProps) {
  const [step, setStep] = useState<"name" | "pix" | "done">("name");
  const [payerName, setPayerName] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const plan = PLANS[type];

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("name");
      setPayerName("");
      setPixKey("");
      setCopied(false);
    }
    onOpenChange(v);
  };

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim() || payerName.trim().length < 2) {
      toast({ title: "Nome inválido", description: "Informe seu nome completo", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await api.createPayment({ payerName: payerName.trim(), type }) as any;
      setPixKey(data.pixKey);
      setStep("pix");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Tente novamente", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyPix = async () => {
    await navigator.clipboard.writeText(pixKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDone = () => {
    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "done" ? "Pagamento Enviado!" : `Comprar ${plan.label}`}
          </DialogTitle>
        </DialogHeader>

        {step === "name" && (
          <form onSubmit={handleSubmitName} className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="font-semibold text-primary text-lg">{plan.price}</div>
              <div className="text-sm text-muted-foreground mt-1">{plan.desc}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payer-name">Seu nome completo (para confirmar o pagamento)</Label>
              <Input
                id="payer-name"
                placeholder="Ex: João da Silva"
                value={payerName}
                onChange={e => setPayerName(e.target.value)}
                required
                minLength={2}
              />
              <p className="text-xs text-muted-foreground">
                Use o nome exato da conta que fará o PIX.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Continuar
              </Button>
            </div>
          </form>
        )}

        {step === "pix" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Valor a transferir</div>
              <div className="font-bold text-2xl text-primary">{plan.price}</div>
            </div>

            <div className="space-y-2">
              <Label>Chave PIX</Label>
              <div className="flex gap-2">
                <Input value={pixKey} readOnly className="font-mono text-sm bg-muted/30" />
                <Button type="button" variant="outline" size="icon" onClick={copyPix} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && <p className="text-xs text-green-500 font-medium">Chave PIX copiada!</p>}
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 space-y-1">
              <p className="font-medium">Como pagar:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Abra o app do seu banco</li>
                <li>Vá em PIX → Transferir</li>
                <li>Cole a chave acima</li>
                <li>Informe o valor: <strong>{plan.price}</strong></li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Após o pagamento, nossa equipe irá aprovar em até 24h.
              Você será notificado por e-mail.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                Fechar
              </Button>
              <Button className="flex-1" onClick={handleDone}>
                Já Paguei!
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center space-y-4 py-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-lg">Obrigado, {payerName.split(" ")[0]}!</p>
              <p className="text-muted-foreground text-sm mt-2">
                Seu pagamento está sendo analisado. Nossa equipe aprovará em até <strong>24 horas</strong>.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Status: Aguardando aprovação
            </Badge>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Entendi, obrigado!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
