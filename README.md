# 🚀 Hexa Dashboard - Gestão Inteligente de Anúncios

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_19-61DAFB.svg?logo=react)
![Node](https://img.shields.io/badge/backend-Node.js-339933.svg?logo=node.js)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg?logo=typescript)
![Status](https://img.shields.io/badge/status-active-success.svg)

O **Hexa Dashboard** é uma plataforma avançada para consolidação e análise de campanhas de tráfego pago (Google Ads, Meta Ads), potencializada por Inteligência Artificial para gerar insights acionáveis em tempo real.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Hexa+Dashboard+Preview)

---

## ✨ Funcionalidades

### 🧠 Inteligência Artificial & Insights
- **Análise Automática**: O sistema analisa métricas de desempenho e sugere otimizações.
- **Detecção de Anomalias**: Alertas sobre gastos excessivos ou queda brusca de performance.

### 📊 Dashboard Temporal Inteligente
O sistema adapta a interface baseada na maturidade da conta do usuário:
*   **Fase de Aprendizado (Dia 0-2)**: Interface de "System Calibration" que monitora a coleta inicial de dados sem exibir gráficos vazios ou confusos.
*   **Fase Ativa (Dia 3+)**: Liberação completa de gráficos comparativos (Hoje vs Ontem, Hoje vs Média de 2 dias) e tendências avançadas.

### ⚡ Tempo Real
- **WebSocket Sync**: Atualizações de leads e gastos instantaneamente na tela, sem necessidade de refresh.
- **Monitoramento Live**: Acompanhe o ROI e o CPL (Custo por Lead) conforme as conversões acontecem.

### 🛡️ Segurança & Arquitetura
- **Autenticação JWT**: Sessões seguras com Refresh Tokens e proteção CSRF.
- **Arquitetura Escalável**: Backend em Node.js com Prisma ORM e Frontend em React (Vite).

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Interface reativa de alta performance. |
| **Estilização** | Tailwind CSS | Design moderno e responsivo. |
| **Gráficos** | Recharts | Visualização de dados interativa. |
| **Backend** | Express + Node.js | API RESTful robusta. |
| **Database** | PostgreSQL + Prisma | ORM moderno e tipado. |
| **Real-time** | Socket.io | Comunicação bidirecional cliente-servidor. |
| **AI Engine** | Google Gemini API | Processamento de linguagem natural para insights. |

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL (Local ou Docker)

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/hexa-dashboard.git
cd hexa-dashboard
```

### 2. Configuração do Backend
```bash
cd server
npm install

# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais de banco e chaves de API
```

### 3. Configuração do Frontend
```bash
# Na raiz do projeto
npm install
```

### 4. Inicialização
Para rodar todo o ambiente (Frontend + Backend) em modo de desenvolvimento:

```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📂 Estrutura de Diretórios

```
Hexa Dashboard/
├── BKP/                # Backups locais automáticos
├── src/                # Código fonte Frontend (React)
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Integração com API
│   └── context/        # Gestão de estado global
├── server/             # Código fonte Backend (Node.js)
│   ├── src/
│   │   ├── controllers/# Lógica de controle
│   │   ├── routes/     # Rotas da API
│   │   └── services/   # Regras de negócio
│   └── prisma/         # Schemas do banco de dados
└── ...
```

---

## 🛡️ Backup Local

O projeto conta com um sistema de backup local para arquivos críticos.
Consulte o [README_BKP.md](./BKP/README_BKP.md) para mais detalhes sobre como executar e restaurar backups.

---

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

Desenvolvido com 💜 pela equipe Hexa.
