
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
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    estimatedClicks: number; // Nova métrica
  };
}

export const fetchRealAds = async (query: string, region: 'Nacional' | 'Internacional'): Promise<{ ads: RealAd[] }> => {
  try {
    const isDiscovery = !query || query === 'Produtos dropshipping virais';
    
    const prompt = `AJA COMO UM INVESTIGADOR DE ADS DE ELITE. 
    OBJETIVO: Encontrar anúncios REAIS e seus links de origem na Biblioteca de Anúncios.

    ${isDiscovery ? `Busque 15 anúncios de dropshipping vencedores em alta agora em ${region}.` : `Busque anúncios específicos para o termo: "${query}" em ${region}.`}
    
    CRITÉRIOS:
    1. "sourceUrl": Link da Ad Library ou Loja.
    2. "thumbnail": Imagem do criativo.
    3. Estime os cliques com base no engajamento (Geralmente 10x a 20x o número de likes para anúncios vencedores).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
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
                  trendScore: { type: Type.STRING },
                  category: { type: Type.STRING },
                  metrics: {
                    type: Type.OBJECT,
                    properties: {
                      likes: { type: Type.NUMBER },
                      comments: { type: Type.NUMBER },
                      shares: { type: Type.NUMBER },
                      estimatedClicks: { type: Type.NUMBER }
                    },
                    required: ["likes", "comments", "shares", "estimatedClicks"]
                  }
                },
                required: ["platform", "sourceUrl", "title", "trendScore", "category", "metrics"]
              }
            }
          },
          required: ["ads"]
        }
      }
    });

    const text = response.text || '{"ads": []}';
    let data = JSON.parse(text);
    
    const processedAds = (data.ads || [])
      .map((ad: any, i: number) => {
        let finalUrl = ad.sourceUrl.trim();
        if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;

        const screenshotFallback = `https://s0.wp.com/mshots/v1/${encodeURIComponent(finalUrl)}?w=800&h=1000`;
        const finalThumbnail = (ad.thumbnail && ad.thumbnail.startsWith('http')) 
          ? ad.thumbnail 
          : screenshotFallback;

        // Refinamento da métrica de cliques caso a IA mande valores baixos
        // Fórmula: (Likes * 12) + (Dias Ativos * 50)
        const calcClicks = ad.metrics.estimatedClicks || (ad.metrics.likes * 15) + (ad.activeDays * 30);

        return {
          ...ad,
          id: `ad-${region}-${i}-${Date.now()}`,
          region,
          sourceUrl: finalUrl,
          thumbnail: finalThumbnail,
          isWinner: ad.trendScore === 'HOT' || ad.metrics.likes > 800,
          category: ad.category ? ad.category.toUpperCase().trim() : 'PRODUTO',
          metrics: {
            ...ad.metrics,
            estimatedClicks: Math.floor(calcClicks)
          }
        };
      });

    return { ads: processedAds };
  } catch (error) {
    return { ads: [] };
  }
};

export const analyzeAndImproveAd = async (ad: RealAd) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{
        text: `Analise o anúncio: ${ad.title}. Cliques estimados: ${ad.metrics.estimatedClicks}. Crie uma estratégia para duplicar o CTR.`
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
    return null;
  }
};
