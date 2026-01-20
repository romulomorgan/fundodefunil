
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface RealAd {
  id: string;
  platform: string;
  thumbnail: string;
  title: string;
  description: string;
  activeDays: number;
  sourceUrl: string; 
  originalText: string;
  isWinner: boolean;
  region: 'Nacional' | 'Internacional';
  trendScore: 'HOT' | 'SCALING' | 'NEW';
  category: string;
}

export const fetchRealAds = async (query: string, region: 'Nacional' | 'Internacional'): Promise<{ ads: RealAd[] }> => {
  try {
    const isDiscovery = !query || query === 'Produtos dropshipping virais';
    
    const prompt = isDiscovery 
      ? `AJA COMO UM MINERADOR DE ELITE. Vasculhe o TikTok Creative Center, Facebook Ad Library e Instagram Reels para encontrar os 15 PRODUTOS MAIS VENDIDOS E VIRAIS de ${region === 'Nacional' ? 'Janeiro/Fevereiro de 2025 no Brasil' : '2025 Globalmente'}. 
         Foque em: Gadgets, Beleza, Cozinha, Pets, Ferramentas e Decoração que estão com alto engajamento.`
      : `Busque produtos e anúncios reais para o nicho: "${query}" em todas as redes sociais (${region}).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ads: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  thumbnail: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING },
                  activeDays: { type: Type.NUMBER },
                  originalText: { type: Type.STRING },
                  trendScore: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Categoria curta e objetiva (Ex: BELEZA, PET, GADGETS, COZINHA)" }
                },
                required: ["platform", "sourceUrl", "title", "trendScore", "category"]
              }
            }
          },
          required: ["ads"]
        }
      }
    });

    const text = response.text || '{"ads": []}';
    let data = JSON.parse(text);
    
    const processedAds = (data.ads || []).map((ad: any, i: number) => {
      let finalUrl = ad.sourceUrl;
      if (finalUrl && !finalUrl.startsWith('http')) {
        finalUrl = `https://${finalUrl}`;
      }

      const validThumb = (ad.thumbnail && ad.thumbnail.includes('http')) 
        ? ad.thumbnail 
        : `https://s0.wp.com/mshots/v1/${encodeURIComponent(finalUrl)}?w=800&h=1000`;

      return {
        ...ad,
        id: `ad-${region}-${i}-${Date.now()}`,
        region,
        sourceUrl: finalUrl,
        thumbnail: validThumb,
        isWinner: ad.trendScore === 'HOT' || ad.activeDays > 7,
        category: ad.category ? ad.category.toUpperCase() : 'OUTROS'
      };
    });

    return { ads: processedAds };
  } catch (error) {
    console.error("Erro na busca SpyEdge:", error);
    return { ads: [] };
  }
};

export const analyzeAndImproveAd = async (ad: RealAd) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{
        text: `FAÇA A ENGENHARIA REVERSA DO PRODUTO: ${ad.title}. URL: ${ad.sourceUrl}.`
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            improvedCopies: {
              type: Type.OBJECT,
              properties: {
                vsl_script: { type: Type.STRING },
                advertorial_headline: { type: Type.STRING },
                fb_ad_copy: { type: Type.STRING }
              }
            },
            targeting: {
              type: Type.OBJECT,
              properties: {
                interests: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["analysis", "improvedCopies", "targeting"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro na análise IA:", error);
    return null;
  }
};
