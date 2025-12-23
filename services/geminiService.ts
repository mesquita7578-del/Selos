
import { GoogleGenAI, Type } from "@google/genai";
import { PhilatelyItem, Continent, ItemType, ItemCondition } from "../types";

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

export const analyzeImageForMetadata = async (base64Image: string): Promise<Partial<PhilatelyItem> | null> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1],
      },
    };

    const prompt = `Analise esta imagem de um item filatélico (selo, postal ou envelope FDC).
    Extraia as seguintes informações se visíveis:
    - País (Country)
    - Continente (Escolha um: Europe, Americas, Asia, Africa, Oceania)
    - Ano/Data (Year)
    - Valor facial (Face Value)
    - Tema (Ex: Natureza, História, etc.)
    - Tipo (Escolha um: Selo, Postal, Envelope FDC)
    - Condição sugerida (Escolha um: MINT, Novo, Usado, FDC)
    - Notas (Breve descrição técnica)

    Retorne APENAS um objeto JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            country: { type: Type.STRING },
            continent: { type: Type.STRING },
            date: { type: Type.STRING },
            value: { type: Type.STRING },
            theme: { type: Type.STRING },
            type: { type: Type.STRING },
            condition: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          required: ["country", "type"]
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
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
