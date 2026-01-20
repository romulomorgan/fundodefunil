
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Zap, Loader2, BrainCircuit, Target, Globe, Flag, 
  Info, Download, X, TrendingUp, LayoutGrid, Timer, Flame,
  Instagram, Facebook, PlayCircle, Filter, Sparkles, ShoppingBag, Menu
} from 'lucide-react';
import AdCard from './components/AdCard';
import { analyzeAndImproveAd, fetchRealAds } from './services/geminiService';

const App: React.FC = () => {
  const [region, setRegion] = useState<'Nacional' | 'Internacional'>('Nacional');
  const [searchQuery, setSearchQuery] = useState('');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [iaAnalysis, setIaAnalysis] = useState<any>(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [activePlatform, setActivePlatform] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const performSearch = async (query: string, currentRegion: 'Nacional' | 'Internacional') => {
    setLoading(true);
    setActiveCategory('ALL');
    setIsSidebarOpen(false);
    const result = await fetchRealAds(query || 'Produtos dropshipping virais', currentRegion);
    setAds(result.ads);
    setLoading(false);
  };

  useEffect(() => {
    performSearch(searchQuery, region);
  }, [region]);

  const dynamicCategories = useMemo(() => {
    const cats = new Map<string, number>();
    ads.forEach(ad => {
      const catName = ad.category ? ad.category.trim().toUpperCase() : 'OUTROS';
      cats.set(catName, (cats.get(catName) || 0) + 1);
    });
    return Array.from(cats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [ads]);

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchPlatform = activePlatform === 'ALL' || ad.platform.toUpperCase().includes(activePlatform);
      const matchCategory = activeCategory === 'ALL' || (ad.category && ad.category.toUpperCase() === activeCategory);
      return matchPlatform && matchCategory;
    });
  }, [ads, activePlatform, activeCategory]);

  const handleStartAnalysis = async (ad: any) => {
    setSelectedAd(ad);
    setLoadingIA(true);
    const result = await analyzeAndImproveAd(ad);
    setIaAnalysis(result);
    setLoadingIA(false);
  };

  const handleDownloadProject = () => {
    if (!selectedAd || !iaAnalysis) return;
    const projectData = { produto: selectedAd.title, analise: iaAnalysis };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SpyEdge_${selectedAd.title.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-200 bg-[#070b14] relative">
      {/* Sidebar - Overlay no Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0f1d] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">SpyEdge</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500"><X size={24}/></button>
        </div>
        
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Alcance</div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setRegion('Nacional')}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${region === 'Nacional' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
              >
                <Flag size={18} /> <span>Brasil / LATAM</span>
              </button>
              <button 
                onClick={() => setRegion('Internacional')}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${region === 'Internacional' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
              >
                <Globe size={18} /> <span>Internacional</span>
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               Categorias Ativas <Sparkles size={10} />
            </div>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => { setActiveCategory('ALL'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${activeCategory === 'ALL' ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-2"><LayoutGrid size={14}/> Ver Tudo</span>
                <span className="bg-white/5 px-2 py-0.5 rounded-md text-[9px]">{ads.length}</span>
              </button>
              
              {dynamicCategories.map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => { setActiveCategory(cat.name); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${activeCategory === cat.name ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="truncate flex items-center gap-2">
                    <ShoppingBag size={14} className="opacity-50" />
                    {cat.name}
                  </span>
                  <span className="bg-white/5 px-2 py-0.5 rounded-md text-[9px] group-hover:bg-indigo-500/20 transition-colors">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Backdrop para Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-[#070b14] overflow-hidden">
        {/* Header Responsivo */}
        <header className="flex flex-col lg:flex-row border-b border-white/5 p-4 lg:px-10 lg:h-24 gap-4 bg-[#070b14]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400">
              <Menu size={20} />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery, region)}
                placeholder="Busca avançada..."
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
              <button onClick={() => setActivePlatform('ALL')} className={`px-3 py-2 text-[9px] font-black rounded-lg transition-all ${activePlatform === 'ALL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>ALL</button>
              <button onClick={() => setActivePlatform('TIKTOK')} className={`px-3 py-2 text-[9px] font-black rounded-lg transition-all ${activePlatform === 'TIKTOK' ? 'bg-white text-black' : 'text-slate-500'}`}>TIKTOK</button>
              <button onClick={() => setActivePlatform('FACEBOOK')} className={`px-3 py-2 text-[9px] font-black rounded-lg transition-all ${activePlatform === 'FACEBOOK' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>META</button>
            </div>

            <button 
              onClick={() => performSearch(searchQuery, region)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 shadow-2xl shadow-indigo-600/40 uppercase whitespace-nowrap"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Flame size={16} />}
              <span className="hidden xs:inline">Minerar</span>
            </button>
          </div>
        </header>

        {/* Feed de Produtos Responsivo */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter text-white flex items-center flex-wrap gap-2">
              Matrix de Resultados <span className="text-indigo-500 not-italic font-bold text-[10px] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">LIVE DATA</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {ads.length} anúncios ativos encontrados.
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 aspect-[4/5] rounded-[2rem] border border-white/5 animate-pulse"></div>
              ))
            ) : (
              filteredAds.map(ad => <AdCard key={ad.id} ad={ad} onAnalyze={handleStartAnalysis} />)
            )}
          </div>
          
          {!loading && filteredAds.length === 0 && (
            <div className="py-20 lg:py-40 text-center">
               <Filter size={40} className="text-slate-800 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-500 uppercase italic">Sem resultados</h3>
               <button onClick={() => {setActivePlatform('ALL'); setActiveCategory('ALL');}} className="mt-4 text-indigo-500 font-black text-[10px] uppercase tracking-widest underline underline-offset-4">Resetar Filtros</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Inteligência Adaptativo */}
      {selectedAd && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/80 backdrop-blur-md">
          <div className="w-full lg:max-w-2xl bg-[#0a0f1d] h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-300">
            <div className="p-6 lg:p-10 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0f1d] z-10">
              <h2 className="text-lg lg:text-2xl font-black uppercase italic flex items-center gap-3">
                <BrainCircuit className="text-indigo-400" size={24} /> <span className="truncate max-w-[200px] lg:max-w-none">Inteligência</span>
              </h2>
              <button onClick={() => setSelectedAd(null)} className="text-slate-500 hover:text-white p-2"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar space-y-8">
              <div className="bg-white/5 border border-white/10 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem]">
                <h3 className="text-xl lg:text-2xl font-black text-white mb-4 leading-tight">{selectedAd.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedAd.category}</span>
                  <span className="bg-white/10 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedAd.platform}</span>
                </div>
              </div>

              {loadingIA ? (
                <div className="py-20 text-center space-y-4">
                  <Loader2 className="animate-spin text-indigo-500 mx-auto" size={40} />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Analisando Dados...</p>
                </div>
              ) : iaAnalysis && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">🎯 Estratégia</h4>
                    <div className="bg-slate-900/50 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/5 text-slate-300 text-sm italic leading-relaxed">
                      {iaAnalysis.analysis}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">🔥 Sugestões</h4>
                    <div className="grid gap-3">
                      {Object.entries(iaAnalysis.improvedCopies).map(([key, val]: any) => (
                        <div key={key} className="bg-white/5 p-5 rounded-xl border border-white/5">
                          <span className="text-[8px] font-black text-indigo-400 uppercase mb-2 block">{key.replace('_', ' ')}</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                     <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center lg:text-left">Targeting Público</h4>
                     <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                        {iaAnalysis.targeting.interests.map((int: string) => (
                          <span key={int} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">{int}</span>
                        ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 lg:p-10 border-t border-white/5 bg-[#0a0f1d] sticky bottom-0">
              <button 
                onClick={handleDownloadProject}
                disabled={loadingIA || !iaAnalysis}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} /> Baixar Creative Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
