# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.1.0] - 2025-12-23

### ✨ Novidades (Features)
- **Dashboard Temporal**: Implementada lógica de ciclo de vida da conta.
  - **Dia 0-2 (Setup)**: Exibição de estado de "Calibragem do Sistema" para novas contas, com barra de progresso e explicações sobre a coleta de dados.
  - **Dia 3+ (Active)**: Ativação completa das métricas com comparativos históricos (Hoje vs Ontem, Hoje vs Média de 2 dias).
- **Empty State Inteligente**: Componente visual dedicado para contas novas, substituindo gráficos vazios ou dados mockados.
- **Sistema de Backup Local**: Implementado script de backup automático (`backup_script.ps1`) e diretório `BKP` para segurança de arquivos críticos.

### 🐛 Correções (Fixes)
- **Autenticação**: Resolvido erro `401 Unauthorized` no login adicionando persistência correta do token.
- **Crypto Crash**: Corrigido erro `crypto.randomBytes is not a function` no backend.
- **Mock Mode**: Desativado modo de teste forçado; o sistema agora prioriza dados reais e autenticação de usuários reais.
- **Clean State**: Removidos dados "fake" que poluíam a visualização de contas reais sem dados.

### 🛠 Técnico
- **API**: Melhoria na interceptação de requests e tratamento de tokens.
- **Integração**: Refatoração do `integrationService` para suportar cálculo de médias móveis de 2 dias.
- **Docs**: Atualização completa do README com instruções de instalação e funcionalidades.

---

## [1.0.0] - Versão Inicial
- Lançamento inicial do Hexa Dashboard.
- Integração com Google Ads e Meta Ads (Mock).
- Sistema de autenticação JWT.
- Dashboard com gráficos em tempo real via WebSocket.
- AI Insights (Gemini) para análise de campanhas.
