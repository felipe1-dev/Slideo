import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Generation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Presentation, Clock, Trash2, Loader2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [items, setItems] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      api.getHistory(50, 0).then((data: any) => {
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await api.deleteSlide(id);
      setItems(items.filter(i => i.id !== id));
      setTotal(t => t - 1);
      toast({ title: "Apresentação excluída" });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || !user) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Histórico</h1>
            <p className="text-muted-foreground mt-1">{total} apresentações criadas</p>
          </div>
          <Link href="/gerar">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" /> Nova Apresentação
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Presentation className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma apresentação ainda.</p>
              <Link href="/gerar">
                <Button className="mt-4 gap-2">
                  <Sparkles className="h-4 w-4" /> Criar agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(g => (
              <Card key={g.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="h-28 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Presentation className="h-10 w-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-2">{g.prompt}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{g.slideCount} slides</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{g.style}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(g.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/apresentacao/${g.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          {deleting === g.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir apresentação?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(g.id)} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
