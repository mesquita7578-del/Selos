
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
        body: `Item de ${item.country} guardado com sucesso!`,
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
      <div className="space-y-12 pb-24">
        <section id="dashboard" className="flex flex-col lg:flex-row gap-8 items-start scroll-mt-32">
           <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Exploração <span className="text-cyan-500">Live</span></h2>
              <p className="text-slate-500 max-w-md">Gestão de alta performance para coleções de elite. Digitalize e analise raridades instantaneamente.</p>
              {aiInsight && <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-left-4"><div className="text-xl">✨</div><p className="text-xs text-cyan-100 italic">{aiInsight}</p></div>}
           </div>
           <div className="w-full lg:w-80">
              <WorldMap data={continentStats} selectedContinent={selectedContinent} onSelect={setSelectedContinent} />
           </div>
        </section>

        <section id="collection" className="space-y-8 scroll-mt-32">
           <div className="flex flex-col lg:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50">
              <div className="relative flex-1 w-full">
                <input type="text" placeholder="Procurar no arquivo por país ou tema..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-3 outline-none focus:border-cyan-500 transition-all text-sm" value={filter} onChange={e => setFilter(e.target.value)} />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <span className="hidden xl:inline text-[9px] font-black text-slate-600 uppercase tracking-widest">Ordenar</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="flex-1 lg:w-48 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">
                   <option value="createdAt_desc">Mais Recentes</option>
                   <option value="country_asc">País: A-Z</option>
                   <option value="value_desc">Valor: Decrescente</option>
                </select>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {/* Botão de Novo Registro Rápido */}
              <button onClick={() => setIsFormOpen(true)} className="aspect-square bg-cyan-500/5 border-2 border-dashed border-cyan-500/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all group">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80">Novo Registro</span>
              </button>

              {sortedAndFilteredItems.slice(0, visibleCount).map(item => (
                <ItemCard key={item.id} item={item} onDelete={id => deleteItemFromDB(id).then(() => setItems(prev => prev.filter(i => i.id !== id)))} onEdit={setEditingItem} onUpdate={handleSaveItem} />
              ))}
           </div>

           {visibleCount < sortedAndFilteredItems.length && <div ref={loaderRef} className="py-12 flex justify-center"><button onClick={() => setVisibleCount(v => v + 12)} className="px-8 py-3 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all">Ver Mais Itens</button></div>}
           
           {sortedAndFilteredItems.length === 0 && (
             <div className="text-center py-24 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800/50">
               <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Nenhum item filtrado nesta região.</p>
             </div>
           )}
        </section>
      </div>

      <VoiceAssistant collectionSummary={items.slice(0, 50).map(i => `${i.country} ${i.type}`).join(', ')} />
      
      {showStatsModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="w-full max-w-5xl h-[85vh] bg-slate-900 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                 </div>
                 <h2 className="text-xl font-black neon-text uppercase tracking-widest">Painel Analítico</h2>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all text-2xl">&times;</button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8 scrollbar-hide">
              <CollectionStats items={items} />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-center">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Arquivamento Digital V.2.5 - Total: {items.length} Registos</p>
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
