
import React, { useState } from 'react';
import { Zap, ExternalLink, TrendingUp, Flame, Star, ThumbsUp, MessageCircle, Share2, MousePointer2, X, ShoppingCart } from 'lucide-react';

interface AdCardProps {
  ad: any;
  onAnalyze: (ad: any) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onAnalyze }) => {
  const [showUrlModal, setShowUrlModal] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  const trendStyles = {
    HOT: { bg: 'bg-red-500', icon: <Flame size={12} className="fill-current" />, text: 'PRODUTO HOT' },
    SCALING: { bg: 'bg-orange-500', icon: <TrendingUp size={12} />, text: 'EM ESCALA' },
    NEW: { bg: 'bg-blue-500', icon: <Star size={12} />, text: 'NOVIDADE' }
  };

  const style = trendStyles[ad.trendScore as keyof typeof trendStyles] || trendStyles.NEW;

  // Simulando múltiplas URLs encontradas pela inteligência para o popup
  // Em um cenário real, essas URLs viriam do groundingMetadata do Gemini
  const productUrls = [
    { label: 'Loja Concorrente A (Shopify)', url: ad.sourceUrl },
    { label: 'Página de Vendas (Landing Page)', url: `${ad.sourceUrl}?ref=spyedge` },
    { label: 'Checkout Direto', url: ad.sourceUrl.includes('products') ? ad.sourceUrl.replace('/products/', '/cart/') : ad.sourceUrl },
  ];

  return (
    <div className="relative bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-indigo-400/50 transition-all group flex flex-col h-full hover:shadow-[0_0_50px_rgba(99,102,241,0.1)] p-6">
      
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-6">
        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
          {ad.platform}
        </span>
        <div className="bg-indigo-600/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 flex items-center gap-2">
          <MousePointer2 size={12} className="text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400">{formatNumber(ad.metrics.estimatedClicks)} <span className="text-[8px] opacity-70">CLICKS</span></span>
        </div>
      </div>

      {/* Título Centralizado (Substituindo Imagem) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2 border-y border-white/5 my-4 bg-white/[0.02] rounded-[1.5rem]">
        <div className={`${style.bg} text-white text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1 mb-4 shadow-lg self-center`}>
          {style.icon} {style.text}
        </div>
        <h3 className="font-black text-white text-lg lg:text-xl leading-tight uppercase tracking-tight">
          {ad.title}
        </h3>
        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{ad.category}</p>
      </div>

      {/* Métricas e Dias */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <p className="text-[8px] font-black text-slate-600 uppercase">Tempo Ativo</p>
          <p className="text-sm font-black text-white">{ad.activeDays || '7'}+ dias</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <ThumbsUp size={12} className="text-indigo-400 mb-1" />
            <span className="text-[10px] font-bold text-white">{formatNumber(ad.metrics?.likes || 0)}</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle size={12} className="text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold text-white">{formatNumber(ad.metrics?.comments || 0)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Share2 size={12} className="text-amber-400 mb-1" />
            <span className="text-[10px] font-bold text-white">{formatNumber(ad.metrics?.shares || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Botões de Ação */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <a 
            href={ad.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] uppercase border border-white/5"
          >
            <ExternalLink size={14} /> Ad Library
          </a>
          <button 
            onClick={() => setShowUrlModal(true)}
            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] uppercase border border-indigo-500/20"
          >
            <ShoppingCart size={14} /> Produtos URL
          </button>
        </div>
        <button 
          onClick={() => onAnalyze(ad)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase shadow-lg shadow-indigo-600/20"
        >
          <Zap size={14} /> Inteligência Artificial
        </button>
      </div>

      {/* Modal de URLs do Produto */}
      {showUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0f1d] w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <ShoppingCart size={16} className="text-white" />
                </div>
                <h4 className="font-black text-white text-sm uppercase italic">Fontes Encontradas</h4>
              </div>
              <button 
                onClick={() => setShowUrlModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-tighter">
                Clique em uma URL para espionar a oferta do concorrente:
              </p>
              {productUrls.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tight mb-1">{item.label}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{item.url}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </a>
              ))}
            </div>
            <div className="p-6 bg-white/[0.01] text-center border-t border-white/5">
              <p className="text-[9px] font-bold text-slate-600 uppercase">Mapeamento via SpyEdge Crawler</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdCard;
