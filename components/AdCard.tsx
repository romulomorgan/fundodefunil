
import React, { useState } from 'react';
import { Zap, ExternalLink, MousePointer2, ShoppingCart, TrendingUp, Flame, Star } from 'lucide-react';

interface AdCardProps {
  ad: any;
  onAnalyze: (ad: any) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onAnalyze }) => {
  const [imgError, setImgError] = useState(false);

  const handleImgError = (e: any) => {
    if (!imgError) {
      setImgError(true);
      e.target.src = `https://s0.wp.com/mshots/v1/${encodeURIComponent(ad.sourceUrl)}?w=800&h=1000`;
    }
  };

  const trendStyles = {
    HOT: { bg: 'bg-red-500', icon: <Flame size={12} className="fill-current" />, text: 'PRODUTO HOT' },
    SCALING: { bg: 'bg-orange-500', icon: <TrendingUp size={12} />, text: 'EM ESCALA' },
    NEW: { bg: 'bg-blue-500', icon: <Star size={12} />, text: 'NOVIDADE' }
  };

  const style = trendStyles[ad.trendScore as keyof typeof trendStyles] || trendStyles.NEW;

  return (
    <div className="relative bg-[#0f172a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-indigo-400/50 transition-all group flex flex-col h-full hover:shadow-[0_0_50px_rgba(99,102,241,0.1)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-900 shrink-0">
        <img 
          src={ad.thumbnail} 
          alt={ad.title}
          onError={handleImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/10"></div>
        
        {/* Badge de Plataforma */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
            {ad.platform}
          </span>
          <span className={`${style.bg} text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg`}>
            {style.icon} {style.text}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Tempo Ativo</p>
            <p className="text-sm font-black text-white">{ad.activeDays || '7'}+ dias</p>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-3">
        <h3 className="font-black text-white text-sm leading-tight uppercase line-clamp-2 min-h-[2.5rem]">
          {ad.title}
        </h3>

        <div className="mt-auto flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <a 
              href={ad.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase border border-white/5"
            >
              <ShoppingCart size={14} /> Ver Loja
            </a>
            <button 
              onClick={() => onAnalyze(ad)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase shadow-lg shadow-indigo-600/20"
            >
              <Zap size={14} /> Espionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
