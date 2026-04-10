import { type ReactNode } from "react";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Sparkles, History, CreditCard, Shield, LogOut, Presentation, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/gerar", label: "Gerar", icon: Sparkles },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/precos", label: "Planos", icon: CreditCard },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Presentation className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Slideo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 text-muted-foreground hover:text-foreground",
                    location === href && "text-foreground bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
            {user?.isAdmin && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-1.5 text-yellow-500 hover:text-yellow-400", location === "/admin" && "bg-accent")}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">{user.name?.split(" ")[0]}</span>
                  <Badge variant={user.plan === "pro" ? "default" : "secondary"} className="text-xs px-1.5 hidden sm:block">
                    {user.plan === "pro" ? "Pro" : "Free"}
                  </Badge>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/pagamentos">
                    <CreditCard className="h-4 w-4 mr-2" /> Meus Pagamentos
                  </Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="h-4 w-4 mr-2" /> Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <EmailVerificationBanner />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground space-y-2">
        <p>© {new Date().getFullYear()} Slideo — Apresentações com IA</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
          <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
          <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
        </div>
      </footer>
    </div>
  );
}
