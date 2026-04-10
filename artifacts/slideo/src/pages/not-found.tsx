import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Presentation } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Presentation className="h-8 w-8 text-primary/50" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Página não encontrada</p>
        <Link href="/">
          <Button>Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
