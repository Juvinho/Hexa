# Hexa Dashboard 🚀

![Hexa Dashboard Banner](https://img.shields.io/badge/Hexa-Dashboard-indigo?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**Hexa Dashboard** é uma plataforma de gerenciamento de anúncios poderosa, moderna e de alto desempenho, projetada para otimizar o rastreamento de campanhas, gerenciamento de leads e relatórios. Construído com as tecnologias web mais recentes, oferece uma experiência de usuário fluida e responsiva.

## ✨ Funcionalidades

*   **📊 Dashboard Interativo**: Visualização em tempo real dos principais indicadores de desempenho (KPIs).
*   **📢 Gerenciamento de Campanhas**: Crie, edite e acompanhe campanhas publicitárias em várias plataformas.
*   **👥 Rastreamento de Leads**: Sistema abrangente de gerenciamento de leads com rastreamento de status.
*   **📈 Relatórios Detalhados**: Análises aprofundadas e relatórios exportáveis para decisões baseadas em dados.
*   **🔐 Autenticação Segura**: Autenticação robusta baseada em JWT com suporte a login social (Google, GitHub).
*   **🎨 UI/UX Moderna**: Uma interface bonita e com tema escuro, construída com Tailwind CSS e Framer Motion.
*   **📱 Design Responsivo**: Totalmente otimizado para desktop, tablets e dispositivos móveis.

## 🛠️ Stack Tecnológico

### Frontend
*   **Framework**: [React](https://reactjs.org/) (v18)
*   **Ferramenta de Build**: [Vite](https://vitejs.dev/)
*   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (v4 - Configuração CSS-first)
*   **Ícones**: [Lucide React](https://lucide.dev/)
*   **Roteamento**: [React Router](https://reactrouter.com/)
*   **Gerenciamento de Estado**: React Context API
*   **Formulários**: React Hook Form + Validação Zod

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **ORM de Banco de Dados**: [Prisma](https://www.prisma.io/)
*   **Autenticação**: JSON Web Tokens (JWT)

## 🚀 Começando

Siga estes passos para configurar o projeto localmente em sua máquina.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (v16 ou superior)
*   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/Juvinho/Hexa.git
    cd Hexa
    ```

2.  **Instale as dependências**
    ```bash
    # Instalar dependências da raiz (se houver)
    npm install

    # Instalar dependências do Frontend
    npm install

    # Instalar dependências do Backend
    cd server
    npm install
    cd ..
    ```

3.  **Configuração de Ambiente**
    Crie um arquivo `.env` no diretório `server` e configure seu banco de dados e segredo JWT:
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="sua_chave_super_secreta"
    ```

4.  **Configuração do Banco de Dados**
    ```bash
    cd server
    npx prisma generate
    npx prisma migrate dev --name init
    cd ..
    ```

5.  **Rodar a Aplicação**
    Você pode rodar o frontend e o backend simultaneamente (se os scripts estiverem configurados) ou em terminais separados.

    **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```

    **Terminal 2 (Frontend):**
    ```bash
    npm run dev
    ```

6.  **Acessar o Dashboard**
    Abra seu navegador e acesse `http://localhost:5173` (ou a porta mostrada no seu terminal).

## 🧪 Testes

Para rodar os testes automatizados:

```bash
npm run test
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

1.  Faça um Fork do projeto
2.  Crie sua branch de feature (`git checkout -b feature/RecursoIncrivel`)
3.  Faça o Commit de suas mudanças (`git commit -m 'Adiciona algum RecursoIncrivel'`)
4.  Faça o Push para a branch (`git push origin feature/RecursoIncrivel`)
5.  Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/Juvinho">Juvinho</a>
</p>
