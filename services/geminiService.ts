
import { GoogleGenAI } from "@google/genai";
import { PhilatelyItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getSmartDescription = async (item: Partial<PhilatelyItem>): Promise<string> => {
  try {
    const prompt = `Atue como um especialista em filatelia e numismática. 
    Gere uma descrição breve e elegante (máximo 200 caracteres) em Português para o seguinte item:
    Tipo: ${item.type}
    País: ${item.country}
    Data: ${item.date}
    Tema: ${item.theme}
    Estado: ${item.condition}
    Valor original: ${item.value}
    Foque no contexto histórico ou na relevância do tema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Sem descrição disponível.";
  } catch (error) {
    console.error("Error generating smart description:", error);
    return "Erro ao gerar descrição inteligente.";
  }
};

export const searchPhilatelicInfo = async (query: string): Promise<{ text: string; sources: any[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise detalhes técnicos e históricos sobre este item filatélico: "${query}". 
      Retorne informações como: Ano exato, Tema principal, raridade e curiosidades. 
      Responda em Português de forma estruturada.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "Nenhuma informação detalhada encontrada.",
      sources: sources
    };
  } catch (error) {
    console.error("Error searching philatelic info:", error);
    return { text: "Erro ao realizar busca automática.", sources: [] };
  }
};

export const analyzeCollection = async (items: PhilatelyItem[]): Promise<string> => {
  try {
    const summary = items.slice(0, 50).map(i => `${i.type} (${i.country}, ${i.date})`).join(", ");
    const prompt = `Analise este conjunto de itens de uma coleção filatélica: ${summary}. 
    Dê um conselho curto (uma frase) para o colecionador sobre possíveis lacunas ou tendências da coleção.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Continue colecionando!";
  } catch (error) {
    return "Dica: Mantenha seus selos em locais secos e protegidos da luz.";
  }
};
