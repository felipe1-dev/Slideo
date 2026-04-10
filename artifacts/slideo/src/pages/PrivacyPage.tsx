import { Link } from "wouter";
import { Presentation } from "lucide-react";

export default function PrivacyPage() {
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
        <h1>Política de Privacidade</h1>
        <p className="text-muted-foreground text-sm">Última atualização: abril de 2025</p>

        <h2>1. Introdução</h2>
        <p>
          O Slideo respeita sua privacidade. Esta política descreve quais dados coletamos,
          como os usamos e quais são seus direitos conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <h2>2. Dados Coletados</h2>
        <p>Coletamos os seguintes dados ao usar o Slideo:</p>
        <ul>
          <li><strong>Dados de cadastro:</strong> nome, endereço de e-mail e senha (armazenada em hash);</li>
          <li><strong>Dados de uso:</strong> prompts enviados, apresentações geradas, histórico de gerações;</li>
          <li><strong>Dados técnicos:</strong> endereço IP, fingerprint do dispositivo (para prevenção de fraudes);</li>
          <li><strong>Dados de pagamento:</strong> nome do pagador e tipo de plano adquirido (não armazenamos dados bancários);</li>
          <li><strong>Dados de sessão:</strong> cookies de autenticação para manter você conectado.</li>
        </ul>

        <h2>3. Finalidade do Uso dos Dados</h2>
        <p>Utilizamos seus dados para:</p>
        <ul>
          <li>Autenticar sua conta e manter a segurança do serviço;</li>
          <li>Gerar apresentações com IA conforme seus prompts;</li>
          <li>Controlar os limites de uso do seu plano;</li>
          <li>Processar pagamentos e gerenciar assinaturas;</li>
          <li>Enviar e-mails transacionais (verificação, confirmação de pagamento);</li>
          <li>Prevenir fraudes e abusos (contas duplicadas, uso irregular);</li>
          <li>Melhorar o serviço com base em dados anonimizados.</li>
        </ul>

        <h2>4. Compartilhamento de Dados</h2>
        <p>
          Não vendemos seus dados pessoais. Compartilhamos apenas com:
        </p>
        <ul>
          <li><strong>Google Gemini (IA):</strong> os prompts que você envia para geração de slides;</li>
          <li><strong>Resend:</strong> serviço de e-mail transacional para verificação e notificações;</li>
          <li><strong>Railway:</strong> infraestrutura de hospedagem onde o serviço roda.</li>
        </ul>

        <h2>5. Retenção de Dados</h2>
        <p>
          Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar exclusão da conta,
          removeremos seus dados pessoais em até 30 dias, exceto quando exigido por lei.
          Apresentações geradas serão excluídas junto com a conta.
        </p>

        <h2>6. Segurança</h2>
        <p>
          Adotamos medidas técnicas para proteger seus dados, incluindo:
          criptografia de senhas (bcrypt), transmissão via HTTPS, sessões seguras com HttpOnly
          e tokens de verificação com expiração. Nenhum sistema é 100% seguro —
          notificamos em caso de incidentes relevantes.
        </p>

        <h2>7. Seus Direitos (LGPD)</h2>
        <p>Você tem direito a:</p>
        <ul>
          <li>Acessar os dados que temos sobre você;</li>
          <li>Corrigir dados incorretos;</li>
          <li>Solicitar exclusão dos seus dados;</li>
          <li>Revogar consentimento a qualquer momento;</li>
          <li>Portabilidade dos dados (mediante solicitação).</li>
        </ul>
        <p>Para exercer esses direitos, entre em contato: <strong>privacidade@slideo.com.br</strong></p>

        <h2>8. Menores de Idade</h2>
        <p>
          O Slideo não é direcionado a menores de 13 anos. Não coletamos intencionalmente
          dados de crianças. Se identificarmos tal situação, a conta será excluída.
        </p>

        <h2>9. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Comunicaremos mudanças substanciais
          por e-mail. A data da última atualização sempre estará indicada no topo desta página.
        </p>

        <h2>10. Contato</h2>
        <p>
          Dúvidas sobre privacidade: <strong>privacidade@slideo.com.br</strong>
        </p>

        <div className="border-t border-border/40 pt-6 mt-8 flex gap-4 text-sm">
          <Link href="/termos" className="text-primary hover:underline">Termos de Serviço</Link>
          <Link href="/cookies" className="text-primary hover:underline">Política de Cookies</Link>
          <Link href="/" className="text-muted-foreground hover:underline">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
