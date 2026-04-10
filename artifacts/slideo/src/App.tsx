import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import GeneratePage from "@/pages/GeneratePage";
import ViewerPage from "@/pages/ViewerPage";
import HistoryPage from "@/pages/HistoryPage";
import PricingPage from "@/pages/PricingPage";
import PaymentsPage from "@/pages/PaymentsPage";
import AdminPage from "@/pages/AdminPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import CookiesPage from "@/pages/CookiesPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/cadastro" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/gerar" component={GeneratePage} />
      <Route path="/historico" component={HistoryPage} />
      <Route path="/precos" component={PricingPage} />
      <Route path="/pagamentos" component={PaymentsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/verificar-email" component={VerifyEmailPage} />
      <Route path="/termos" component={TermsPage} />
      <Route path="/privacidade" component={PrivacyPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/apresentacao/:id" component={ViewerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
