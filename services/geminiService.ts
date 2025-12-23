
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PhilatelyItem, Continent, ItemType, ItemCondition } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartDescription = async (item: Partial<PhilatelyItem>): Promise<string> => {
  try {
    const prompt = `Atue como um especialista em filatelia e numismática. Gere uma descrição técnica e elegante em PORTUGUÊS (máx 200 caracteres) para: ${item.type} de ${item.country} (${item.date}). Tema: ${item.theme}. Foque na importância histórica ou estética.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Sem descrição disponível.";
  } catch (error) {
    return "Erro ao gerar descrição.";
  }
};

export const analyzeDualImages = async (frontB64: string, backB64: string): Promise<Partial<PhilatelyItem> | null> => {
  try {
    const parts = [
      { inlineData: { mimeType: 'image/jpeg', data: frontB64.split(',')[1] } },
      { inlineData: { mimeType: 'image/jpeg', data: backB64.split(',')[1] } },
      { text: `Analise a frente e o verso deste item. Extraia os dados em PORTUGUÊS. 
      Campos obrigatórios: País, Continente (Africa, Americas, Asia, Europe, Oceania), Ano, Valor Facial (ex: 50 cts), Tema (História, Natureza, Arte, etc), 
      Tipo (Selo, Postal, Envelope FDC), Condição (MINT, Novo, Usado, FDC) e Notas técnicas (carimbos, estado dos dentes, filigranas). 
      Retorne APENAS o JSON.` }
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
    console.error("Erro na análise dual:", error);
    return null;
  }
};

export const evaluateMarketPrice = async (item: PhilatelyItem): Promise<{ summary: string; sources: any[] }> => {
  try {
    const query = `Qual o valor de mercado atual, raridade e histórico de leilões para este item filatélico: ${item.type} de ${item.country}, ano ${item.date}, tema ${item.theme}, valor facial ${item.value}. Responda em PORTUGUÊS com detalhes técnicos.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é um perito avaliador de leilões internacionais. Forneça cotações e análises técnicas detalhadas sempre em PORTUGUÊS."
      },
    });
    return {
      summary: response.text || "Dados de mercado não localizados no momento.",
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
    contents: { parts: [imagePart, { text: "Detecte elementos visuais: legendas, coordenadas (0-100) e descrições técnicas em PORTUGUÊS. Retorne JSON." }] },
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
      contents: `Resumo do acervo: ${summary}. Dê uma dica estratégica de investimento ou curadoria para o colecionador em uma frase curta e impactante em PORTUGUÊS.`,
    });
    return response.text || "Continue explorando novas raridades mundiais!";
  } catch (e) {
    return "Mantenha o seu arquivo digital sempre atualizado.";
  }
};
