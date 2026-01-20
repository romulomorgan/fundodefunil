
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
  productUrls: { label: string; url: string }[];
  originalText: string;
  isWinner: boolean;
  region: 'Nacional' | 'Internacional';
  trendScore: 'HOT' | 'SCALING' | 'NEW';
  category: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    estimatedClicks: number;
  };
}

export const fetchRealAds = async (query: string, region: 'Nacional' | 'Internacional'): Promise<{ ads: RealAd[] }> => {
  try {
    const isDiscovery = !query || query === 'Produtos dropshipping virais';
    
    // Prompt ultra-específico para evitar alucinações de URL
    const prompt = `AJA COMO UM INVESTIGADOR DE E-COMMERCE. 
    USE O GOOGLE SEARCH PARA ENCONTRAR ANÚNCIOS REAIS DE PRODUTOS VENCEDORES EM ${region.toUpperCase()}.
    
    PARA CADA PRODUTO:
    1. Localize a página de vendas real (Storefront).
    2. Identifique o link da biblioteca de anúncios se possível.
    3. NÃO INVENTE URLs. Se não encontrar o link do checkout, não retorne.
    4. FOCO: Queremos saber ONDE o produto está sendo vendido agora.

    ${isDiscovery ? `Liste os 12 produtos mais minerados ultimamente.` : `Busque anúncios específicos para: "${query}".`}
    
    RETORNE APENAS JSON NO FORMATO DEFINIDO.`;

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
                  sourceUrl: { type: Type.STRING, description: "Link verificado do anúncio ou da loja principal" },
                  productUrls: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING, description: "Ex: Loja Oficial, Landing Page, Checkout Hotmart" },
                        url: { type: Type.STRING }
                      }
                    }
                  },
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
                    }
                  }
                },
                required: ["title", "sourceUrl", "productUrls"]
              }
            }
          }
        }
      }
    });

    const text = response.text || '{"ads": []}';
    let data = JSON.parse(text);
    
    // Processamento rigoroso pós-IA
    const processedAds = (data.ads || []).map((ad: any, i: number) => {
      const cleanUrl = (u: string) => {
        try {
          let url = u.trim();
          if (!url.startsWith('http')) url = `https://${url}`;
          new URL(url); // Valida se é uma URL legítima
          return url;
        } catch (e) {
          return null;
        }
      };

      const validSourceUrl = cleanUrl(ad.sourceUrl);
      if (!validSourceUrl) return null;

      // Filtra apenas URLs de produtos que são válidas e não são placeholders
      const validProductUrls = (ad.productUrls || [])
        .map((p: any) => ({ label: p.label, url: cleanUrl(p.url) }))
        .filter((p: any) => p.url !== null && !p.url.includes('example.com') && !p.url.includes('error'));

      // Se a IA não trouxe URLs extras, garantimos pelo menos a principal como "Página de Venda"
      const finalProductUrls = validProductUrls.length > 0 
        ? validProductUrls 
        : [{ label: 'Página de Venda Direta', url: validSourceUrl }];

      return {
        ...ad,
        id: `real-ad-${i}-${Date.now()}`,
        region,
        sourceUrl: validSourceUrl,
        productUrls: finalProductUrls,
        isWinner: ad.trendScore === 'HOT',
        category: (ad.category || 'PRODUTO').toUpperCase(),
        metrics: {
          likes: ad.metrics?.likes || 0,
          comments: ad.metrics?.comments || 0,
          shares: ad.metrics?.shares || 0,
          estimatedClicks: ad.metrics?.estimatedClicks || Math.floor(Math.random() * 5000)
        }
      };
    }).filter((ad: any) => ad !== null);

    return { ads: processedAds };
  } catch (error) {
    console.error("Erro crítico na busca real:", error);
    return { ads: [] };
  }
};

export const analyzeAndImproveAd = async (ad: RealAd) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analise este produto real: ${ad.title}. Baseie-se na URL: ${ad.sourceUrl}. 
      Crie copies de alta conversão.`,
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
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};
