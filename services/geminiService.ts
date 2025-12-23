
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PhilatelyItem, Continent, ItemType, ItemCondition } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartDescription = async (item: Partial<PhilatelyItem>): Promise<string> => {
  try {
    const prompt = `Atue como um especialista em filatelia. Gere uma descrição elegante (máx 200 caracteres) para: ${item.type} de ${item.country} (${item.date}). Tema: ${item.theme}.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Sem descrição.";
  } catch (error) {
    return "Erro ao gerar descrição.";
  }
};

export const analyzeDualImages = async (frontB64: string, backB64: string): Promise<Partial<PhilatelyItem> | null> => {
  try {
    const parts = [
      { inlineData: { mimeType: 'image/jpeg', data: frontB64.split(',')[1] } },
      { inlineData: { mimeType: 'image/jpeg', data: backB64.split(',')[1] } },
      { text: `Analise a frente e o verso deste item filatélico. Extraia: País, Continente (Europe, Americas, Asia, Africa, Oceania), Ano, Valor Facial, Tema, Tipo, Condição e Notas técnicas (carimbos, marcas de água). Retorne JSON.` }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
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
          }
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Dual image analysis error:", error);
    return null;
  }
};

export const evaluateMarketPrice = async (item: PhilatelyItem): Promise<{ summary: string; sources: any[] }> => {
  try {
    const query = `Preço atual de mercado, raridade e histórico de leilões para: ${item.type} ${item.country} ${item.date} ${item.theme} valor facial ${item.value}.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é um avaliador de leilões filatélicos sênior. Forneça estimativas de preços baseadas em buscas reais."
      },
    });
    return {
      summary: response.text || "Não foi possível encontrar dados de mercado precisos.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { summary: "Erro na pesquisa de mercado.", sources: [] };
  }
};

export const detectVisualElements = async (base64Image: string): Promise<any> => {
  const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } };
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: "Detect visual elements: labels, coordinates (0-100), and descriptions. Return JSON." }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                description: { type: Type.STRING }
              }
            }
          },
          suggestedTheme: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"elements":[], "suggestedTheme": ""}');
};

export const analyzeCollection = async (items: PhilatelyItem[]): Promise<string> => {
  try {
    const summary = items.slice(0, 30).map(i => `${i.country} ${i.date}`).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Resumo da coleção: ${summary}. Dê uma dica estratégica para o colecionador em uma frase curta.`,
    });
    return response.text || "Continue explorando novos continentes!";
  } catch (e) {
    return "Mantenha seu arquivo digital atualizado.";
  }
};
