import { GoogleGenAI } from "@google/genai";
import { PlatformData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketingInsights = async (
  platform: string,
  data: PlatformData[]
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  // Prepare a summary of the data for the prompt
  const dataSummary = data.map(p => 
    `${p.name}: Gasto R$${p.spend}, ROI ${p.roi}x, Leads ${p.leads}, CPA R$${(p.spend/p.leads).toFixed(2)}`
  ).join('\n');

  const prompt = `
    Você é o assistente inteligente do "Hexa", um dashboard de gestão de tráfego pago.
    Analise os seguintes dados de campanha em tempo real:
    
    ${dataSummary}

    O usuário está visualizando a plataforma: ${platform === 'all' ? 'Visão Geral (Todas)' : platform}.
    
    Forneça 3 insights curtos, acionáveis e estratégicos (max 1 parágrafo cada) em Português do Brasil para melhorar a performance. 
    Foque em ROI, redução de CPA e escala. Use formatação Markdown (negrito/listas) para facilitar a leitura.
    Se o ROI estiver baixo em alguma plataforma, sugira uma ação de correção.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep thought for UI dashboards
      }
    });
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "Erro ao conectar com a inteligência artificial. Verifique sua chave API.";
  }
};