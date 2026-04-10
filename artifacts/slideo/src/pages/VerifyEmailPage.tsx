import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Presentation, MailCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const pendente = params.get("pendente");
  const { refresh, user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (pendente === "1") {
      setStatus("pending");
      return;
    }
    if (!token) { setStatus("error"); setMessage("Token inválido ou ausente."); return; }
    api.verifyEmail(token)
      .then((data: any) => {
        setStatus("success");
        setMessage(data.message || "E-mail verificado com sucesso!");
        refresh();
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "Token inválido ou expirado.");
      });
  }, [token, pendente]);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.resendVerification();
      setResent(true);
      toast({ title: "E-mail reenviado!", description: "Verifique sua caixa de entrada e spam." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Presentation className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl">Slideo</span>
        </Link>

        <Card>
          <CardContent className="py-10 space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Verificando seu e-mail...</p>
              </>
            )}

            {status === "pending" && (
              <>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MailCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Confirme seu e-mail!</h2>
                <p className="text-muted-foreground text-sm">
                  Enviamos um link de verificação para <strong>{user?.email}</strong>.
                  Clique no link para ativar sua conta e começar a usar o Slideo.
                </p>
                <p className="text-xs text-muted-foreground">
                  Não encontrou? Verifique a pasta de spam.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleResend}
                  disabled={resending || resent}
                >
                  {resent ? (
                    <><CheckCircle className="h-4 w-4 text-green-500" /> E-mail reenviado!</>
                  ) : (
                    <><RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} /> Reenviar e-mail</>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    Já verifiquei — ir para o painel
                  </Button>
                </Link>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
                <h2 className="text-xl font-bold">E-mail verificado!</h2>
                <p className="text-muted-foreground text-sm">{message}</p>
                <Link href="/gerar">
                  <Button className="w-full">Começar a criar apresentações</Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-14 w-14 text-destructive mx-auto" />
                <h2 className="text-xl font-bold">Ops! Algo deu errado</h2>
                <p className="text-muted-foreground text-sm">{message}</p>
                <Button
                  variant="outline"
                  className="w-full gap-2 mb-2"
                  onClick={handleResend}
                  disabled={resending || resent}
                >
                  {resent ? (
                    <><CheckCircle className="h-4 w-4 text-green-500" /> E-mail reenviado!</>
                  ) : (
                    <><RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} /> Solicitar novo link</>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full">Ir para o painel</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
