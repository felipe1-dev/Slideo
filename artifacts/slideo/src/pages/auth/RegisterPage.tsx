import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Presentation, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (user) { setLocation("/dashboard"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Senha muito curta", description: "Mínimo 8 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fingerprint = await getDeviceFingerprint();
      const data = await api.register({ name, email, password, fingerprint }) as any;
      login(data.user);
      if (!data.user.emailVerified) {
        setLocation("/verificar-email?pendente=1");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Erro no cadastro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-10 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Verifique seu e-mail!</h2>
            <p className="text-muted-foreground text-sm">
              Enviamos um link de verificação para <strong>{email}</strong>.
              Clique no link para ativar sua conta.
            </p>
            <p className="text-xs text-muted-foreground">
              Não encontrou? Verifique a pasta de spam.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Ir para o painel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Presentation className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">Slideo</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Criar conta grátis</CardTitle>
            <CardDescription>5 apresentações gratuitas todo mês</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" placeholder="João da Silva" value={name} onChange={e => setName(e.target.value)} required minLength={2} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Criar minha conta
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Entrar</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
