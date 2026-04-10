import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, AlertCircle, CreditCard } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

const STYLES = [
  { value: "modern", label: "Moderno" },
  { value: "corporate", label: "Corporativo" },
  { value: "creative", label: "Criativo" },
  { value: "minimal", label: "Minimalista" },
  { value: "bold", label: "Ousado" },
];

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [slideCount, setSlideCount] = useState([8]);
  const [style, setStyle] = useState("modern");
  const [mode, setMode] = useState("traditional");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [payModal, setPayModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading]);

  const maxSlides = user?.plan === "pro" ? 30 : 10;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 3) {
      toast({ title: "Descreva sua apresentação", description: "Use pelo menos 3 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLimitReached(false);
    try {
      const data = await api.generateSlides({
        prompt: prompt.trim(),
        slideCount: slideCount[0],
        mode,
        style,
        language: "pt",
      }) as any;
      setLocation(`/apresentacao/${data.id}`);
    } catch (err: any) {
      if (err.message?.includes("Limite") || err.message?.includes("429")) {
        setLimitReached(true);
      } else {
        toast({ title: "Erro ao gerar", description: err.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gerar Apresentação</h1>
          <p className="text-muted-foreground mt-1">Descreva o tema e a IA cria os slides para você</p>
        </div>

        {limitReached && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Limite de gerações atingido</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Faça upgrade para Pro ou compre créditos extras.
                </p>
                <Button size="sm" className="mt-3 gap-2" onClick={() => setPayModal(true)}>
                  <CreditCard className="h-4 w-4" /> Ver planos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-medium">
              Sobre o que é sua apresentação?
            </Label>
            <Textarea
              id="prompt"
              placeholder="Ex: Introdução ao Marketing Digital para pequenas empresas, focando em redes sociais e SEO..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              className="resize-none text-base"
              required
              minLength={3}
            />
            <p className="text-xs text-muted-foreground">{prompt.length}/2000 caracteres</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número de Slides: <span className="font-bold text-primary">{slideCount[0]}</span></Label>
              <Slider
                value={slideCount}
                onValueChange={setSlideCount}
                min={3}
                max={maxSlides}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span>
                <span>{maxSlides} {user.plan === "free" && "(Pro: 30)"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estilo Visual</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de apresentação</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "traditional", label: "Tradicional", desc: "Slides lineares clássicos" },
                { value: "interactive", label: "Interativa", desc: "Quiz e elementos interativos" },
              ].map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${mode === m.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className="font-medium text-sm">{m.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Badge variant={user.plan === "pro" ? "default" : "secondary"} className="text-xs">
              {user.plan === "pro" ? "Pro" : "Free"}
            </Badge>
            {user.plan === "free"
              ? "Plano Free: até 10 slides · 5 gerações/mês"
              : "Plano Pro: até 30 slides · 200 gerações/mês"}
          </div>

          <Button type="submit" className="w-full gap-2 text-base" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando slides com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Gerar Apresentação
              </>
            )}
          </Button>
        </form>

        <PaymentModal
          open={payModal}
          onOpenChange={setPayModal}
          type="pro_monthly"
        />
      </div>
    </Layout>
  );
}
