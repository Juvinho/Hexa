# Documentação de Integração IA (Google Gemini)

Este documento descreve o processo de integração, configuração e manutenção da inteligência artificial (Google Gemini) no Hexa Dashboard.

## 1. Visão Geral
O sistema utiliza a API `Google Generative AI` (modelo `gemini-1.5-flash`) para fornecer duas funcionalidades principais:
1.  **Insights Estratégicos:** Análise automática das métricas do dashboard para gerar sugestões acionáveis.
2.  **Chat Assistente:** Um assistente virtual capaz de responder perguntas sobre os dados exibidos.

## 2. Configuração

### Pré-requisitos
*   Node.js v18+
*   Chave de API do Google Gemini (`GEMINI_API_KEY`)

### Variáveis de Ambiente
No arquivo `.env` do servidor (`server/.env`), configure a chave:

```env
GEMINI_API_KEY="sua_chave_aqui"
```

> **Nota:** Se a chave não for fornecida, o sistema entrará automaticamente em **Modo Mock**, retornando dados simulados para garantir que a interface continue funcional (ideal para desenvolvimento/testes).

## 3. Fluxo de Processamento

### Geração de Insights (`/ai/insights`)
1.  **Entrada:** O frontend envia um objeto JSON contendo as métricas atuais (Leads, ROI, Investimento, etc.).
2.  **Validação:** O backend verifica se os dados existem.
3.  **Prompt Engineering:** Os dados são inseridos em um prompt estruturado que instrui a IA a atuar como um "Especialista em Marketing Sênior".
4.  **Processamento:** A requisição é enviada ao modelo `gemini-1.5-flash`.
5.  **Tratamento de Resposta:**
    *   O sistema tenta extrair um array JSON válido da resposta da IA.
    *   Caso a IA retorne texto formatado (Markdown), o sistema utiliza Regex para isolar o JSON.
    *   Fallback: Se o JSON falhar, o sistema divide o texto em linhas.
6.  **Retorno:** O frontend recebe a lista de insights pronta para exibição.

### Chat Assistente (`/ai/chat`)
1.  **Entrada:** Mensagem do usuário + Contexto atual (dados da tela).
2.  **Prompt:** A IA recebe o contexto e a pergunta, instruída a ser concisa e profissional.
3.  **Retorno:** Resposta em texto simples.

## 4. Tratamento de Erros e Limites

A integração possui tratamento robusto para os seguintes cenários:

*   **API Key Ausente:** Retorna status 503 com flag `mock: true`. O frontend exibe os dados simulados mas avisa no console.
*   **Rate Limiting (Erro 429):** Se o limite de requisições do Google for atingido (comum no tier gratuito), o sistema entra automaticamente em **Modo Mock Temporário**, exibindo insights demonstrativos e avisando o usuário ("IA sobrecarregada"). Isso garante que a UI nunca quebre.
*   **Bloqueio de Segurança:** Se o prompt violar políticas de segurança, o erro é capturado e tratado.
*   **Falha de Parseamento:** Se a IA não retornar o formato esperado, o sistema tenta recuperar o conteúdo útil via manipulação de strings.

## 5. Testes e Validação

Para verificar se a integração está funcionando:
1.  Acesse o Dashboard.
2.  Abra o console do navegador (F12).
3.  Clique em "Gerar Insights".
4.  Verifique os logs com prefixo `[AI]`.
    *   Sucesso: `Successfully parsed JSON insights`.
    *   Erro: Mensagens de erro detalhadas aparecerão no terminal do servidor.

## 6. Manutenção Futura

*   **Atualização de Modelo:** Para alterar a versão da IA, edite `server/src/controllers/aiController.ts` e altere a string `"gemini-1.5-flash"` para o modelo desejado (ex: `"gemini-1.5-pro"`).
*   **Ajuste de Prompts:** Os prompts estão definidos diretamente no controller. Podem ser refinados para alterar o "tom de voz" ou o foco da análise.
