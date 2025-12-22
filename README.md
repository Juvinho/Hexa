# Hexa Dashboard 🚀

<div align="center">

![Hexa Dashboard Banner](https://img.shields.io/badge/Hexa-Dashboard-indigo?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

**A Solução Definitiva para Gestão de Anúncios e Campanhas.**

[Demonstração](#) • [Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Contribuir](#-contribuindo)

</div>

---

## 📖 Sobre

**Hexa Dashboard** é uma plataforma de gerenciamento de anúncios poderosa, moderna e de alto desempenho, projetada para otimizar o rastreamento de campanhas, gerenciamento de leads e relatórios. Construído com as tecnologias web mais recentes, oferece uma experiência de usuário fluida, responsiva e visualmente impactante.

Seja você uma agência de marketing ou um gestor de tráfego independente, o Hexa Dashboard fornece as ferramentas necessárias para escalar suas operações.

---

## ✨ Funcionalidades

### 🖥️ Painel Principal
*   **Dashboard Interativo**: Visualização em tempo real dos principais indicadores de desempenho (KPIs).
*   **Gráficos Dinâmicos**: Acompanhe tendências de crescimento e métricas vitais.

### 📢 Gestão de Campanhas
*   **Controle Total**: Crie, edite e pause campanhas com facilidade.
*   **Multi-plataforma**: Suporte para rastreamento de diversas fontes de tráfego.

### 👥 CRM de Leads
*   **Pipeline de Vendas**: Kanban ou lista para gerenciar o status dos leads.
*   **Rastreamento Detalhado**: Histórico completo de interações com cada lead.

### ⚙️ Sistema e Segurança
*   **Autenticação JWT**: Login seguro com suporte a OAuth (Google, GitHub).
*   **Controle de Acesso (RBAC)**: Permissões granulares para diferentes tipos de usuários.
*   **Tema Escuro**: Interface "Dark Mode" nativa para menor cansaço visual.

---

## 🛠️ Stack Tecnológico

<details>
  <summary><b>Frontend</b></summary>

*   **Framework**: [React](https://reactjs.org/) (v18)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (v4 - Configuração CSS-first)
*   **Ícones**: [Lucide React](https://lucide.dev/)
*   **Roteamento**: [React Router](https://reactrouter.com/)
*   **Estado**: React Context API
*   **Formulários**: React Hook Form + Zod

</details>

<details>
  <summary><b>Backend</b></summary>

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Banco de Dados**: SQLite (Dev) / PostgreSQL (Prod)
*   **Auth**: JSON Web Tokens (JWT)

</details>

---

## 📂 Estrutura do Projeto

```
Hexa/
├── src/                # Código fonte do Frontend
│   ├── components/     # Componentes Reutilizáveis
│   ├── context/        # Gerenciamento de Estado Global
│   ├── pages/          # Páginas da Aplicação
│   └── styles/         # Estilos Globais
├── server/             # Backend API
│   ├── src/            # Código fonte do Backend
│   ├── prisma/         # Schemas e Migrations do Banco de Dados
│   └── routes/         # Rotas da API
└── public/             # Assets Estáticos
```

---

## 🚀 Começando

Siga estes passos para configurar o projeto localmente em sua máquina.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (v16 ou superior)
*   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)

### 🔧 Instalação

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/Juvinho/Hexa.git
    cd Hexa
    ```

2.  **Instale as dependências**
    ```bash
    npm install         # Raiz
    cd server && npm install  # Backend
    cd ..               # Voltar para raiz
    ```

3.  **Configuração de Ambiente (.env)**
    Crie um arquivo `.env` no diretório `server`:
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="sua_chave_super_secreta_aqui"
    PORT=3000
    ```

4.  **Banco de Dados**
    ```bash
    cd server
    npx prisma generate
    npx prisma migrate dev --name init
    cd ..
    ```

5.  **Rodar a Aplicação**
    Recomendamos abrir dois terminais:

    **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```

    **Terminal 2 (Frontend):**
    ```bash
    npm run dev
    ```

6.  **Acessar**
    Abra `http://localhost:5173` no seu navegador.

---

## 🗺️ Roadmap

- [x] Dashboard Inicial
- [x] Autenticação (Login/Registro)
- [x] CRUD de Campanhas
- [x] Listagem de Leads
- [ ] Integração com Facebook Ads API
- [ ] Exportação de Relatórios em PDF/CSV
- [ ] Sistema de Notificações em Tempo Real
- [ ] Modo Light (Tema Claro)

---

## 🤝 Contribuindo

Contribuições são o que fazem a comunidade open source um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

1.  Faça um Fork do projeto
2.  Crie sua Feature Branch (`git checkout -b feature/RecursoIncrivel`)
3.  Commit suas mudanças (`git commit -m 'Add: RecursoIncrivel'`)
4.  Push para a Branch (`git push origin feature/RecursoIncrivel`)
5.  Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Feito com ❤️ por [Juvinho](https://github.com/Juvinho)**

[![Linkedin Badge](https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/seu-linkedin)](https://www.linkedin.com/in/seu-linkedin)
[![Gmail Badge](https://img.shields.io/badge/-Gmail-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:seuemail@gmail.com)](mailto:seuemail@gmail.com)

</div>
