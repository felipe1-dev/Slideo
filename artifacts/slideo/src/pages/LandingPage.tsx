import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaymentModal from "@/components/PaymentModal";
import { Sparkles, Presentation, Zap, Check, ChevronRight, Star } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [payModal, setPayModal] = useState<{ open: boolean; type: "pro_monthly" | "credits_50" }>({ open: false, type: "pro_monthly" });

  if (user) { setLocation("/dashboard"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Presentation className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Slideo</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-6 text-xs gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" /> Powered by Inteligência Artificial
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Crie apresentações{" "}
          <span className="text-primary">incríveis</span>{" "}
          em segundos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Descreva o tema e a IA gera slides profissionais completos.
          Economia de horas de trabalho com visual impecável.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/cadastro">
            <Button size="lg" className="gap-2 text-base px-8">
              <Sparkles className="h-5 w-5" /> Gerar minha apresentação
            </Button>
          </Link>
          <Link href="/precos">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8">
              Ver planos <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Grátis para começar · Sem cartão de crédito
        </p>
      </section>

      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Rápido como um raio", desc: "Gere uma apresentação completa em menos de 30 segundos com IA avançada." },
            { icon: Star, title: "Design profissional", desc: "Layouts modernos e elegantes prontos para apresentar para clientes ou equipes." },
            { icon: Presentation, title: "Totalmente personalizável", desc: "Escolha o estilo, número de slides e o idioma da sua apresentação." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 max-w-4xl mx-auto" id="precos">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Planos simples e transparentes</h2>
          <p className="text-muted-foreground">Pague com PIX · Aprovação em até 24h</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg">Free</h3>
              <div className="text-3xl font-bold mt-1">R$ 0</div>
              <div className="text-sm text-muted-foreground">para sempre</div>
            </div>
            <ul className="space-y-2 text-sm">
              {["5 apresentações/mês", "Até 10 slides", "IA básica"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/cadastro">
              <Button variant="outline" className="w-full">Começar grátis</Button>
            </Link>
          </div>

          <div className="rounded-xl border-2 border-primary p-6 space-y-4 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3">Mais popular</Badge>
            <div>
              <h3 className="font-bold text-lg">Pro</h3>
              <div className="text-3xl font-bold mt-1 text-primary">R$ 29</div>
              <div className="text-sm text-muted-foreground">por mês · via PIX</div>
            </div>
            <ul className="space-y-2 text-sm">
              {["200 apresentações/mês", "Até 30 slides", "IA premium (GPT-4)", "Suporte prioritário"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={() => { if (user) setPayModal({ open: true, type: "pro_monthly" }); else setLocation("/cadastro"); }}>
              Assinar Pro
            </Button>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg">Créditos</h3>
              <div className="text-3xl font-bold mt-1">R$ 15</div>
              <div className="text-sm text-muted-foreground">50 gerações extras</div>
            </div>
            <ul className="space-y-2 text-sm">
              {["50 gerações extras", "Não expiram", "Qualquer plano", "Acumulam"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" onClick={() => { if (user) setPayModal({ open: true, type: "credits_50" }); else setLocation("/cadastro"); }}>
              Comprar Créditos
            </Button>
          </div>
        </div>
      </section>

      <PaymentModal open={payModal.open} onOpenChange={v => setPayModal(p => ({ ...p, open: v }))} type={payModal.type} />

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Slideo · Feito no Brasil com ❤️
      </footer>
    </div>
  );
}
