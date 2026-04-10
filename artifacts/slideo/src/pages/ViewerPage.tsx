import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { api, type Generation, type SlideContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, ChevronRight, ArrowLeft, Download, Sparkles, Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";

function SlideView({ slide, style }: { slide: SlideContent; style: string }) {
  const gradients: Record<string, string> = {
    modern: "from-primary/20 via-primary/5 to-transparent",
    corporate: "from-blue-500/20 via-blue-500/5 to-transparent",
    creative: "from-purple-500/20 via-pink-500/5 to-transparent",
    minimal: "from-gray-500/10 via-gray-500/5 to-transparent",
    bold: "from-orange-500/20 via-red-500/5 to-transparent",
  };
  const gradient = gradients[style] || gradients.modern;

  return (
    <div className={cn("w-full aspect-video rounded-xl border border-border overflow-hidden relative bg-card flex flex-col", "bg-gradient-to-br", gradient)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center relative z-10">
        {slide.type === "title" ? (
          <>
            <div className="h-1.5 w-12 bg-primary rounded-full mb-6" />
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
            {slide.subtitle && <p className="text-lg md:text-xl text-muted-foreground mt-4">{slide.subtitle}</p>}
          </>
        ) : slide.type === "section" ? (
          <>
            <Badge variant="secondary" className="mb-4 text-xs">{slide.slideNumber}</Badge>
            <h2 className="text-2xl md:text-4xl font-bold">{slide.title}</h2>
            {slide.subtitle && <p className="text-muted-foreground mt-3">{slide.subtitle}</p>}
          </>
        ) : slide.type === "quote" ? (
          <div className="max-w-2xl">
            <div className="text-6xl text-primary/30 leading-none mb-2">"</div>
            <p className="text-xl md:text-2xl italic font-medium">{slide.title}</p>
            {slide.subtitle && <p className="text-muted-foreground mt-4">— {slide.subtitle}</p>}
          </div>
        ) : (
          <div className="w-full max-w-3xl text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{slide.title}</h2>
            {slide.bullets && slide.bullets.length > 0 && (
              <ul className="space-y-3">
                {slide.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </span>
                    <span className="text-base md:text-lg">{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {slide.interactiveElements && slide.interactiveElements.length > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="font-medium mb-3">{slide.interactiveElements[0].label}</p>
                {slide.interactiveElements[0].options && (
                  <div className="grid grid-cols-2 gap-2">
                    {slide.interactiveElements[0].options.map((opt, i) => (
                      <div key={i} className="p-2 rounded-md bg-background border border-border text-sm text-center">{opt}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-4 right-4 opacity-30">
        <Presentation className="h-5 w-5" />
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground opacity-40">
        {slide.slideNumber}
      </div>
    </div>
  );
}

export default function ViewerPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!params.id) return;
    api.getSlide(Number(params.id)).then((data: any) => {
      setGeneration(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [params.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, generation]);

  const nextSlide = () => {
    if (generation && currentSlide < generation.slides.length - 1) {
      setCurrentSlide(s => s + 1);
    }
  };
  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(s => s - 1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-muted-foreground">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Apresentação não encontrada</p>
          <Link href="/historico"><Button>Ver histórico</Button></Link>
        </div>
      </div>
    );
  }

  const slide = generation.slides[currentSlide];
  const progress = ((currentSlide + 1) / generation.slides.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/historico">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{generation.prompt}</p>
            <p className="text-xs text-muted-foreground">
              {currentSlide + 1} de {generation.slides.length} slides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs hidden sm:block">{generation.style}</Badge>
            <Link href="/gerar">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Nova
              </Button>
            </Link>
          </div>
        </div>
        <Progress value={progress} className="h-0.5 rounded-none" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6">
        <div className="w-full max-w-4xl">
          <SlideView slide={slide} style={generation.style} />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentSlide === 0}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1.5">
            {generation.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === currentSlide ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/50"
                )}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={nextSlide} disabled={currentSlide === generation.slides.length - 1}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {slide.notes && (
          <div className="max-w-2xl w-full p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notas: </span>{slide.notes}
          </div>
        )}
      </div>
    </div>
  );
}
