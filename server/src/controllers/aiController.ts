import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const aiController = {
  async getInsights(req: Request, res: Response) {
    console.log('[AI] Generating insights request received');
    try {
      if (!genAI) {
        console.warn('[AI] No API Key configured. Returning mock insights.');
        return res.status(503).json({ 
          message: 'AI service unavailable (API Key not configured)',
          mock: true,
          insights: [
            "⚠️ Configure a API Key do Gemini no arquivo .env para receber insights reais.",
            "📈 O tráfego aumentou 20% em relação à semana passada.",
            "🎯 A taxa de conversão de leads está acima da média."
          ]
        });
      }

      const { metrics } = req.body;
      console.log('[AI] Metrics received:', JSON.stringify(metrics));
      
      if (!metrics) {
        console.error('[AI] No metrics provided in request body');
        return res.status(400).json({ message: 'Metrics data is required' });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Atue como um Especialista em Marketing e Análise de Dados Sênior.
        Analise as seguintes métricas do dashboard e forneça 3-4 insights estratégicos, curtos e altamente acionáveis.
        
        Dados do Dashboard: ${JSON.stringify(metrics)}
        
        Requisitos:
        1. Responda APENAS com um array JSON de strings. SEM markdown, SEM aspas extras fora do array.
        2. Cada insight deve ter no máximo 20 palavras.
        3. Use emojis no início de cada insight para categorizar (ex: 💰, 🚀, ⚠️).
        4. Foco em ROI, otimização de campanhas e crescimento.
        
        Exemplo de formato:
        ["💰 Aumente o budget em Vídeo Ads pois o ROI está 15% acima da média.", "🚀 Foque em retenção: LTV subiu mas novos leads caíram.", "⚠️ Otimize a Landing Page: Taxa de rejeição aumentou 5%."]
      `;

      console.log('[AI] Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('[AI] Raw response from Gemini:', text);
      
      let insights = [];
      try {
        // Try to find JSON array in the text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
          console.log('[AI] Successfully parsed JSON insights');
        } else {
          console.warn('[AI] No JSON array found in response, falling back to line split');
          // Fallback if AI doesn't return pure JSON
          insights = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'))
            .slice(0, 4);
        }
      } catch (e) {
        console.error('[AI] JSON Parse Error:', e);
        insights = [text];
      }

      res.json({ insights });
    } catch (error: any) {
      console.error('AI Error:', error);

      // Handle Rate Limiting (HTTP 429)
      if (error.status === 429 || error.message?.includes('429')) {
        console.warn('[AI] Rate Limit Exceeded. Falling back to mock insights.');
        return res.json({ 
          message: 'IA sobrecarregada. Exibindo insights demonstrativos.',
          mock: true,
          insights: [
            "⚠️ Tráfego intenso na API da IA. Estes são insights demonstrativos.",
            "💰 Aumente o budget em Vídeo Ads pois o ROI está 15% acima da média.",
            "🚀 Foque em retenção: LTV subiu mas novos leads caíram.",
            "⚠️ Otimize a Landing Page: Taxa de rejeição aumentou 5%."
          ]
        });
      }

      res.status(500).json({ message: 'Error generating insights', error: String(error) });
    }
  },

  async chat(req: Request, res: Response) {
    try {
      if (!genAI) {
        // Mock Chat Response
        const { message } = req.body;
        const mockReplies = [
          "Como estou em modo de demonstração (sem API Key), não posso analisar seus dados reais, mas posso dizer que seus resultados parecem promissores!",
          "Interessante pergunta! No modo completo, eu analisaria seus leads e ROI para responder isso.",
          "Estou operando em modo offline. Configure a GEMINI_API_KEY para habilitar minha inteligência total.",
          "Baseado no que vejo (simulado), recomendo focar em otimizar suas campanhas de vídeo."
        ];
        const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return res.json({ 
          reply: `🤖 [MOCK]: ${randomReply}`,
          mock: true 
        });
      }

      const { message, context } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

      const prompt = `
        Contexto do Sistema: Dashboard Administrativo "Hexa Dashboard".
        Contexto Atual da Página/Dados: ${JSON.stringify(context || {})}
        
        Pergunta do Usuário: ${message}
        
        Responda de forma concisa, profissional e útil, como um assistente virtual do dashboard.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      res.json({ reply: response.text() });
    } catch (error: any) {
      console.error('AI Chat Error:', error);

      // Handle Rate Limiting (HTTP 429)
      if (error.status === 429 || error.message?.includes('429')) {
        console.warn('[AI] Rate Limit Exceeded. Falling back to mock chat.');
        return res.json({ 
          reply: '🤖 [MOCK]: Estou com muitas requisições no momento. Tente novamente em alguns segundos. (Rate Limit Exceeded)',
          mock: true
        });
      }

      res.status(500).json({ message: 'Error processing chat message' });
    }
  }
};
