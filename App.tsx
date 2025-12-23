
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
  const [editingItem, setEditingItem] = useState<PhilatelyItem | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('createdAt_desc');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
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
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div></div>;

  return (
    <Layout onNewClick={() => setIsFormOpen(true)} onExportJson={() => {}} onInstallApp={() => deferredPrompt?.prompt()}>
      <div className="space-y-12 pb-24">
        <section id="dashboard" className="flex flex-col lg:flex-row gap-8 items-start">
           <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">PhilaArchive <span className="text-cyan-500">Live</span></h2>
              <p className="text-slate-500 max-w-md">Gerenciamento de alta fidelidade para coleções de elite. Explore os 5 continentes com suporte a 10.000 imagens.</p>
              {aiInsight && <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-4"><div className="text-xl">✨</div><p className="text-xs text-cyan-100 italic">{aiInsight}</p></div>}
           </div>
           <div className="w-full lg:w-96 grid grid-cols-1 gap-6">
              <WorldMap data={continentStats} selectedContinent={selectedContinent} onSelect={setSelectedContinent} />
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <CollectionStats items={items} />
           <button onClick={() => setIsFormOpen(true)} className="bg-cyan-500/5 border-2 border-dashed border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-cyan-500/10 transition-all">
              <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-slate-950 neon-glow"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></div>
              <span className="text-xs font-black uppercase tracking-widest text-white">Novo Arquivo</span>
           </button>
        </div>

        <section id="collection" className="space-y-8">
           <div className="flex flex-col lg:flex-row gap-4">
              <input type="text" placeholder="Filtrar coleção..." className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 transition-all" value={filter} onChange={e => setFilter(e.target.value)} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 outline-none text-xs font-black uppercase tracking-widest text-slate-400">
                 <option value="createdAt_desc">Recentes</option>
                 <option value="country_asc">País A-Z</option>
                 <option value="value_desc">Valor Máximo</option>
              </select>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {sortedAndFilteredItems.slice(0, visibleCount).map(item => (
                <ItemCard key={item.id} item={item} onDelete={id => deleteItemFromDB(id).then(() => setItems(prev => prev.filter(i => i.id !== id)))} onEdit={setEditingItem} onUpdate={handleSaveItem} />
              ))}
           </div>
           {visibleCount < sortedAndFilteredItems.length && <div ref={loaderRef} className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div></div>}
        </section>
      </div>

      <VoiceAssistant collectionSummary={items.slice(0, 50).map(i => `${i.country} ${i.type}`).join(', ')} />
      {isFormOpen && <ItemForm onSave={handleSaveItem} onCancel={() => setIsFormOpen(false)} />}
      {editingItem && <ItemForm onSave={handleSaveItem} onCancel={() => setEditingItem(null)} initialData={editingItem} />}
    </Layout>
  );
};

export default App;
