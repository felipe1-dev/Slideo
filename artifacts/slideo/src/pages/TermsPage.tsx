import { Link } from "wouter";
import { Presentation } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Presentation className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Slideo</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Termos de Serviço</h1>
        <p className="text-muted-foreground text-sm">Última atualização: abril de 2025</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao criar uma conta e utilizar o Slideo, você concorda com estes Termos de Serviço.
          Se não concordar com algum destes termos, não utilize nosso serviço.
        </p>

        <h2>2. Descrição do Serviço</h2>
        <p>
          O Slideo é uma plataforma de criação de apresentações utilizando Inteligência Artificial.
          Você descreve o tema desejado e nossa IA gera slides profissionais prontos para uso.
          O serviço está disponível nos planos Free e Pro, conforme descritos na página de preços.
        </p>

        <h2>3. Elegibilidade e Conta</h2>
        <p>
          Para utilizar o Slideo, você deve ter ao menos 13 anos de idade e fornecer dados verdadeiros
          no momento do cadastro. Você é responsável por manter a confidencialidade das suas credenciais
          de acesso e por todas as atividades realizadas em sua conta.
        </p>
        <p>
          É obrigatório verificar seu endereço de e-mail para ativar a conta e utilizar os recursos
          de geração de apresentações. Uma conta por pessoa — contas duplicadas poderão ser suspensas.
        </p>

        <h2>4. Planos e Pagamentos</h2>
        <p>
          O Slideo oferece um plano gratuito com 5 apresentações por mês. O plano Pro, com 200
          apresentações mensais, custa R$ 29,00/mês. Pacotes de 50 créditos avulsos estão disponíveis
          por R$ 15,00.
        </p>
        <p>
          Os pagamentos são realizados exclusivamente via PIX e processados manualmente pela nossa
          equipe em até 24 horas úteis. Não há cobrança automática — cada renovação é feita
          manualmente pelo usuário. Não realizamos estornos de créditos já utilizados.
        </p>

        <h2>5. Uso Aceitável</h2>
        <p>É expressamente proibido utilizar o Slideo para:</p>
        <ul>
          <li>Gerar conteúdo ilegal, difamatório, abusivo ou que viole direitos de terceiros;</li>
          <li>Tentar comprometer a segurança ou o funcionamento da plataforma;</li>
          <li>Criar múltiplas contas para burlar os limites do plano gratuito;</li>
          <li>Revender ou redistribuir o serviço sem autorização expressa;</li>
          <li>Utilizar bots, scripts ou automações para gerar apresentações em massa.</li>
        </ul>

        <h2>6. Propriedade Intelectual</h2>
        <p>
          As apresentações geradas pelo Slideo são de sua propriedade. O conteúdo gerado pela IA
          é baseado nos prompts que você fornece. Você é responsável pelo uso das apresentações geradas.
          O Slideo reserva-se o direito de usar dados anonimizados para melhorar o serviço.
        </p>

        <h2>7. Limitação de Responsabilidade</h2>
        <p>
          O Slideo é fornecido "como está". Não garantimos que o serviço estará sempre disponível
          ou livre de erros. Não nos responsabilizamos por danos decorrentes do uso ou impossibilidade
          de uso do serviço, incluindo perda de dados ou lucros cessantes.
        </p>

        <h2>8. Suspensão e Encerramento</h2>
        <p>
          Reservamos o direito de suspender ou encerrar contas que violem estes termos, sem aviso
          prévio. Em caso de encerramento, você perde o acesso às suas apresentações salvas.
        </p>

        <h2>9. Alterações nos Termos</h2>
        <p>
          Podemos atualizar estes termos periodicamente. Alterações substanciais serão comunicadas
          por e-mail. O uso continuado do serviço após a notificação constitui aceitação dos novos termos.
        </p>

        <h2>10. Contato</h2>
        <p>
          Dúvidas sobre estes termos? Entre em contato: <strong>contato@slideo.com.br</strong>
        </p>

        <div className="border-t border-border/40 pt-6 mt-8 flex gap-4 text-sm">
          <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
          <Link href="/cookies" className="text-primary hover:underline">Política de Cookies</Link>
          <Link href="/" className="text-muted-foreground hover:underline">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
