
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import ItemCard from './components/ItemCard';
import CollectionStats from './components/CollectionStats';
import ItemForm from './components/ItemForm';
import WorldMap from './components/WorldMap';
import VoiceAssistant from './components/VoiceAssistant';
import { PhilatelyItem, Continent, ItemType, ItemCondition } from './types';
import { analyzeCollection } from './services/geminiService';
import { getAllItems, saveItem, deleteItemFromDB, bulkSaveItems } from './services/storage';

type SortMode = 'createdAt_desc' | 'createdAt_asc' | 'country_asc' | 'country_desc' | 'value_asc' | 'value_desc';

const App: React.FC = () => {
  const [items, setItems] = useState<PhilatelyItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PhilatelyItem | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('createdAt_desc');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
    
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const loadData = async () => {
      try {
        const data = await getAllItems();
        if (data?.length > 0) setItems(data);
        else {
          const initialItems: PhilatelyItem[] = [{
            id: '1', type: ItemType.STAMP, country: 'Brasil', continent: Continent.AMERICAS, date: '1843', value: '30', theme: 'História', condition: ItemCondition.MINT, notes: 'Olho de Boi.', imageFront: 'https://picsum.photos/seed/stamp1/300/300', imageBack: 'https://picsum.photos/seed/stamp1b/300/300', createdAt: Date.now()
          }];
          setItems(initialItems);
          await bulkSaveItems(initialItems);
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(async () => setAiInsight(await analyzeCollection(items)), 3000);
      return () => clearTimeout(timer);
    }
  }, [items.length]);

  const continentStats = useMemo(() => {
    return items.reduce((acc, i) => ({ ...acc, [i.continent]: (acc[i.continent] || 0) + 1 }), {} as Record<string, number>);
  }, [items]);

  const sortedAndFilteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesText = item.country.toLowerCase().includes(filter.toLowerCase()) || item.theme.toLowerCase().includes(filter.toLowerCase());
      const matchesContinent = !selectedContinent || item.continent === selectedContinent;
      return matchesText && matchesContinent;
    });
    result.sort((a, b) => {
      if (sortBy === 'country_asc') return a.country.localeCompare(b.country);
      if (sortBy === 'value_desc') return (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0);
      return b.createdAt - a.createdAt;
    });
    return result;
  }, [items, filter, selectedContinent, sortBy]);

  const handleSaveItem = async (item: PhilatelyItem) => {
    await saveItem(item);
    setItems(prev => prev.some(i => i.id === item.id) ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev]);
    setIsFormOpen(false);
    setEditingItem(null);
    
    if (Notification.permission === 'granted') {
      new Notification('PhilaArchive Neon', {
        body: `Arquivo de ${item.country} atualizado!`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2095/2095192.png'
      });
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phila_archive_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div></div>;

  return (
    <Layout 
      onNewClick={() => setIsFormOpen(true)} 
      onScanClick={() => setIsFormOpen(true)} 
      onExportJson={handleExport}
      onInstallApp={() => deferredPrompt?.prompt()}
      onStatsClick={() => setShowStatsModal(true)}
      showInstallBtn={!!deferredPrompt}
      continentsData={continentStats}
      selectedContinent={selectedContinent}
      onContinentSelect={setSelectedContinent}
    >
      <div className="space-y-16 pb-32">
        {/* Painel de Boas Vindas e Mapa */}
        <section id="dashboard" className="flex flex-col xl:flex-row gap-12 items-start scroll-mt-48">
           <div className="flex-1 space-y-6">
              <div className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse"></div>
                 <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Curadoria de Elite Ativa</span>
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Exploração <span className="text-cyan-500">Live</span></h2>
              <p className="text-slate-500 text-lg max-w-xl leading-relaxed">Gerencie o seu acervo pessoal de até 10.000 imagens com suporte de inteligência artificial para identificação e cotação de mercado.</p>
              {aiInsight && <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-5 rounded-3xl flex items-center gap-5 shadow-xl animate-in fade-in slide-in-from-left-6"><div className="text-2xl">✨</div><p className="text-sm text-cyan-100 italic leading-relaxed">{aiInsight}</p></div>}
           </div>
           <div className="w-full xl:w-[450px]">
              <WorldMap data={continentStats} selectedContinent={selectedContinent} onSelect={setSelectedContinent} />
           </div>
        </section>

        {/* Galeria de Coleção */}
        <section id="collection" className="space-y-10 scroll-mt-48">
           <div className="flex flex-col lg:flex-row gap-6 items-center bg-slate-900/40 p-5 rounded-[2rem] border border-slate-800/60 shadow-2xl">
              <div className="relative flex-1 w-full">
                <input type="text" placeholder="Pesquisar por país, tema ou detalhe..." className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-14 py-4 outline-none focus:border-cyan-500 transition-all text-sm shadow-inner" value={filter} onChange={e => setFilter(e.target.value)} />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Ordenar</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="flex-1 lg:w-64 bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:border-slate-600 transition-colors">
                   <option value="createdAt_desc">Data: Mais Recentes</option>
                   <option value="country_asc">Alfabética: País A-Z</option>
                   <option value="value_desc">Mercado: Valor Decrescente</option>
                </select>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
              {/* Gatilho de Adição Rápida */}
              <button onClick={() => setIsFormOpen(true)} className="aspect-square bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all group overflow-hidden">
                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-500 shadow-lg group-hover:scale-110 group-hover:neon-glow transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-400">Novo Arquivo</span>
                  <span className="text-[8px] text-slate-700 uppercase font-bold tracking-tighter">Frente + Verso</span>
                </div>
              </button>

              {sortedAndFilteredItems.slice(0, visibleCount).map(item => (
                <ItemCard key={item.id} item={item} onDelete={id => deleteItemFromDB(id).then(() => setItems(prev => prev.filter(i => i.id !== id)))} onEdit={setEditingItem} onUpdate={handleSaveItem} />
              ))}
           </div>

           {visibleCount < sortedAndFilteredItems.length && (
             <div ref={loaderRef} className="py-20 flex justify-center">
               <button onClick={() => setVisibleCount(v => v + 12)} className="px-12 py-4 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-xl">Carregar Mais Peças</button>
             </div>
           )}
           
           {sortedAndFilteredItems.length === 0 && (
             <div className="text-center py-32 bg-slate-900/10 rounded-[3rem] border border-dashed border-slate-800/40">
               <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-800">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <p className="text-slate-600 font-black uppercase tracking-widest text-sm">Nenhum item filtrado nesta região do globo.</p>
             </div>
           )}
        </section>
      </div>

      <VoiceAssistant collectionSummary={items.slice(0, 50).map(i => `${i.country} ${i.type}`).join(', ')} />
      
      {/* Modal Analítico (STATS) */}
      {showStatsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <div className="w-full max-w-6xl h-[85vh] bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                 </div>
                 <div>
                    <h2 className="text-2xl font-black neon-text uppercase tracking-widest leading-none">Análise do Portfólio</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-bold mt-1">Visão Geral Detalhada do Acervo</p>
                 </div>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all text-3xl">&times;</button>
            </div>
            <div className="flex-1 p-10 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-10 scrollbar-hide">
              <CollectionStats items={items} />
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-950/50 text-center">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Processamento Analítico PhilaArchive V.3.1 - Total: {items.length} Registos</span>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && <ItemForm onSave={handleSaveItem} onCancel={() => setIsFormOpen(false)} />}
      {editingItem && <ItemForm onSave={handleSaveItem} onCancel={() => setEditingItem(null)} initialData={editingItem} />}
    </div>
  );
};

export default App;
