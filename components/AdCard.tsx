
import React, { useState } from 'react';
import { Zap, ExternalLink, TrendingUp, Flame, Star, ThumbsUp, MessageCircle, Share2, MousePointer2, X, ShoppingCart, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="relative bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-indigo-400/50 transition-all group flex flex-col h-full hover:shadow-[0_0_50px_rgba(99,102,241,0.1)] p-6">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
          {ad.platform}
        </span>
        <div className="bg-indigo-600/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 flex items-center gap-2">
          <MousePointer2 size={12} className="text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400">{formatNumber(ad.metrics?.estimatedClicks || 0)} <span className="text-[8px] opacity-70">CLICKS</span></span>
        </div>
      </div>

      {/* Título Centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2 border-y border-white/5 my-4 bg-white/[0.02] rounded-[1.5rem]">
        <div className={`${style.bg} text-white text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1 mb-4 shadow-lg self-center`}>
          {style.icon} {style.text}
        </div>
        <h3 className="font-black text-white text-lg lg:text-xl leading-tight uppercase tracking-tight line-clamp-3">
          {ad.title}
        </h3>
        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{ad.category}</p>
      </div>

      {/* Métricas */}
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
      
      {/* Botões */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <a 
            href={ad.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] uppercase border border-white/5"
          >
            <ExternalLink size={14} /> Link Origem
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

      {/* Modal de URLs Reais */}
      {showUrlModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0f1d] w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base uppercase italic tracking-tight">Canais de Venda</h4>
                  <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Links Verificados via Grounding</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUrlModal(false)}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {ad.productUrls && ad.productUrls.length > 0 ? (
                ad.productUrls.map((item: any, idx: number) => (
                  <a 
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                  >
                    <div className="flex flex-col overflow-hidden mr-4">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mb-1">{item.label}</span>
                      <span className="text-xs text-slate-300 truncate font-medium">{item.url}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors shrink-0">
                      <ExternalLink size={16} className="text-white" />
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-xs font-bold uppercase">Nenhuma URL secundária encontrada.</p>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">SpyEdge Crawler Ativo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdCard;
