import { Link } from "wouter";
import { Presentation } from "lucide-react";

export default function CookiesPage() {
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
        <h1>Política de Cookies</h1>
        <p className="text-muted-foreground text-sm">Última atualização: abril de 2025</p>

        <h2>1. O que são Cookies?</h2>
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu navegador quando você acessa
          um site. Eles permitem que o site "lembre" informações sobre sua visita, tornando
          a experiência mais rápida e eficiente.
        </p>

        <h2>2. Cookies que Utilizamos</h2>
        <p>O Slideo utiliza apenas cookies estritamente necessários para o funcionamento do serviço:</p>

        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Finalidade</th>
              <th>Duração</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>connect.sid</code></td>
              <td>Sessão de autenticação — mantém você conectado</td>
              <td>7 dias</td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>Não utilizamos</strong> cookies de rastreamento, publicidade ou analytics de terceiros.
          Não utilizamos Google Analytics, Facebook Pixel, ou qualquer outro sistema de monitoramento
          comportamental.
        </p>

        <h2>3. Cookie de Sessão (connect.sid)</h2>
        <p>
          Este é o único cookie armazenado pelo Slideo. Ele é necessário para manter sua sessão
          ativa após o login, evitando que você precise se autenticar em cada página.
        </p>
        <ul>
          <li><strong>Tipo:</strong> HttpOnly, Secure (em produção)</li>
          <li><strong>Escopo:</strong> Apenas o domínio do Slideo</li>
          <li><strong>Dados:</strong> Identificador de sessão (não contém dados pessoais diretamente)</li>
          <li><strong>Expiração:</strong> 7 dias ou ao fazer logout</li>
        </ul>

        <h2>4. Fingerprint de Dispositivo</h2>
        <p>
          Para prevenção de fraudes e controle de contas duplicadas, coletamos um fingerprint
          do seu dispositivo (combinação de características técnicas do navegador) no momento
          do cadastro. Esse dado é armazenado no nosso banco de dados, não como cookie.
          Consulte nossa <Link href="/privacidade">Política de Privacidade</Link> para mais detalhes.
        </p>

        <h2>5. Como Gerenciar Cookies</h2>
        <p>
          Você pode limpar os cookies do Slideo a qualquer momento pelo seu navegador.
          Isso encerrará sua sessão e você precisará fazer login novamente.
        </p>
        <p>
          Como utilizamos apenas cookies essenciais, bloqueá-los impedirá o funcionamento
          correto do serviço (não será possível manter o login).
        </p>

        <h2>6. Consentimento</h2>
        <p>
          Por utilizarmos exclusivamente cookies técnicos essenciais ao funcionamento do serviço,
          eles não requerem consentimento explícito conforme o Marco Civil da Internet e a LGPD.
          Ao criar uma conta no Slideo, você está ciente do uso deste cookie.
        </p>

        <h2>7. Contato</h2>
        <p>
          Dúvidas sobre nossa política de cookies: <strong>privacidade@slideo.com.br</strong>
        </p>

        <div className="border-t border-border/40 pt-6 mt-8 flex gap-4 text-sm">
          <Link href="/termos" className="text-primary hover:underline">Termos de Serviço</Link>
          <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
          <Link href="/" className="text-muted-foreground hover:underline">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
