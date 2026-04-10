import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MailWarning, RefreshCw, CheckCircle } from "lucide-react";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await api.resendVerification();
      setSent(true);
      toast({ title: "E-mail enviado!", description: "Verifique sua caixa de entrada (e spam)." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <MailWarning className="h-4 w-4 text-yellow-500 shrink-0" />
          <span className="text-yellow-700 dark:text-yellow-400">
            Verifique seu e-mail para liberar a geração de apresentações.
            Enviamos um link para <strong>{user.email}</strong>.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/10 shrink-0"
          onClick={resend}
          disabled={loading || sent}
        >
          {sent ? (
            <><CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Enviado</>
          ) : (
            <><RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Reenviar e-mail</>
          )}
        </Button>
      </div>
    </div>
  );
}
