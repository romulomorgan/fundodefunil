
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Zap, Loader2, BrainCircuit, Target, Globe, Flag, 
  Info, Download, X, TrendingUp, LayoutGrid, Timer, Flame,
  Instagram, Facebook, PlayCircle, Filter, Sparkles, ShoppingBag
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
  const [showManual, setShowManual] = useState(false);
  
  const [activePlatform, setActivePlatform] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const performSearch = async (query: string, currentRegion: 'Nacional' | 'Internacional') => {
    setLoading(true);
    setActiveCategory('ALL'); // Resetar filtro de categoria ao minerar novos dados
    const result = await fetchRealAds(query || 'Produtos dropshipping virais', currentRegion);
    setAds(result.ads);
    setLoading(false);
  };

  useEffect(() => {
    performSearch(searchQuery, region);
  }, [region]);

  // CATEGORIAS DINÂMICAS: Extraídas diretamente dos produtos minerados no momento
  const dynamicCategories = useMemo(() => {
    const cats = new Map<string, number>();
    ads.forEach(ad => {
      const catName = ad.category ? ad.category.trim().toUpperCase() : 'OUTROS';
      cats.set(catName, (cats.get(catName) || 0) + 1);
    });
    // Converte para array de objetos ordenados pela quantidade
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
    <div className="flex h-screen overflow-hidden text-slate-200 bg-[#070b14]">
      {/* Sidebar de Categorias Dinâmicas */}
      <aside className="w-20 lg:w-72 bg-[#0a0f1d] border-r border-white/5 flex flex-col">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <span className="text-xl font-black italic tracking-tighter hidden lg:block uppercase bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">SpyEdge</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Mercado Regional */}
          <div>
            <div className="hidden lg:block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Alcance da Mineração</div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setRegion('Nacional')}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${region === 'Nacional' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
              >
                <Flag size={18} /> <span className="hidden lg:block">Brasil / LATAM</span>
              </button>
              <button 
                onClick={() => setRegion('Internacional')}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${region === 'Internacional' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
              >
                <Globe size={18} /> <span className="hidden lg:block">Internacional</span>
              </button>
            </div>
          </div>

          {/* Categorias Detectadas em Tempo Real */}
          <div>
            <div className="hidden lg:block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               Categorias Encontradas <Sparkles size={10} />
            </div>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveCategory('ALL')}
                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${activeCategory === 'ALL' ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-2"><LayoutGrid size={14}/> Ver Tudo</span>
                <span className="bg-white/5 px-2 py-0.5 rounded-md text-[9px]">{ads.length}</span>
              </button>
              
              {dynamicCategories.length > 0 ? (
                dynamicCategories.map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
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
                ))
              ) : !loading && (
                <div className="p-4 border border-dashed border-white/5 rounded-2xl text-[10px] text-slate-600 italic text-center">
                  Aguardando detecção...
                </div>
              )}
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#070b14]">
        <header className="h-24 border-b border-white/5 flex items-center px-10 gap-6 bg-[#070b14]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery, region)}
              placeholder="Refinar busca por palavra-chave..."
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button onClick={() => setActivePlatform('ALL')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activePlatform === 'ALL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>ALL</button>
            <button onClick={() => setActivePlatform('TIKTOK')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activePlatform === 'TIKTOK' ? 'bg-black text-white' : 'text-slate-500 hover:text-white'}`}>TIKTOK</button>
            <button onClick={() => setActivePlatform('FACEBOOK')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activePlatform === 'FACEBOOK' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>META</button>
          </div>

          <button 
            onClick={() => performSearch(searchQuery, region)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/40 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Flame size={18} />}
            Minerar Agora
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                Matrix de Resultados <span className="text-indigo-500 not-italic font-bold text-sm ml-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">LIVE DATA</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {ads.length} anúncios minerados em {region === 'Nacional' ? 'Brasil' : 'Global'}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 aspect-[4/5] rounded-[2rem] border border-white/5 animate-pulse"></div>
              ))
            ) : (
              filteredAds.map(ad => <AdCard key={ad.id} ad={ad} onAnalyze={handleStartAnalysis} />)
            )}
          </div>
          
          {!loading && filteredAds.length === 0 && (
            <div className="py-40 text-center">
               <Filter size={48} className="text-slate-800 mx-auto mb-6" />
               <h3 className="text-xl font-bold text-slate-500 uppercase italic">Nenhum dado encontrado para os filtros atuais</h3>
               <button onClick={() => {setActivePlatform('ALL'); setActiveCategory('ALL');}} className="mt-4 text-indigo-500 font-black hover:text-indigo-400 uppercase text-xs tracking-widest underline underline-offset-8">Limpar Matriz de Filtros</button>
            </div>
          )}
        </div>
      </main>

      {/* Slide-over de Inteligência */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-all">
          <div className="w-full max-w-2xl bg-[#0a0f1d] h-full shadow-2xl flex flex-col border-l border-white/10">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-[#0a0f1d]">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-4">
                <BrainCircuit className="text-indigo-400" size={28} /> Inteligência de Produto
              </h2>
              <button onClick={() => setSelectedAd(null)} className="text-slate-500 hover:text-white p-2 transition-colors"><X size={28}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={100} /></div>
                <h3 className="text-2xl font-black text-white mb-4 leading-tight">{selectedAd.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedAd.category}</span>
                  <span className="bg-white/10 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedAd.platform}</span>
                </div>
              </div>

              {loadingIA ? (
                <div className="py-24 text-center space-y-6">
                  <Loader2 className="animate-spin text-indigo-500 mx-auto" size={56} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Gerando Engenharia Reversa...</p>
                </div>
              ) : iaAnalysis && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">🎯 Estratégia de Guerra</h4>
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 text-slate-300 leading-relaxed italic text-sm">
                      {iaAnalysis.analysis}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">🔥 Novos Criativos Sugeridos</h4>
                    <div className="grid gap-4">
                      {Object.entries(iaAnalysis.improvedCopies).map(([key, val]: any) => (
                        <div key={key} className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-indigo-500/40 transition-all">
                          <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-1 rounded block w-fit mb-3">{key.replace('_', ' ')}</span>
                          <p className="text-sm text-slate-300 leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">📍 Público Alvo Estimado</h4>
                     <div className="flex flex-wrap gap-2">
                        {iaAnalysis.targeting.interests.map((int: string) => (
                          <span key={int} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-tighter">{int}</span>
                        ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-10 border-t border-white/5 bg-[#0a0f1d]">
              <button 
                onClick={handleDownloadProject}
                disabled={loadingIA || !iaAnalysis}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all"
              >
                <Download size={18} /> Baixar Projeto de Escala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
