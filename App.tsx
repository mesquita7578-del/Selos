
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import ItemCard from './components/ItemCard';
import CollectionStats from './components/CollectionStats';
import ItemForm from './components/ItemForm';
import { PhilatelyItem, Continent, ItemType, ItemCondition } from './types';
import { analyzeCollection } from './services/geminiService';

type SortMode = 'createdAt_desc' | 'createdAt_asc' | 'country_asc' | 'country_desc' | 'value_asc' | 'value_desc';

const App: React.FC = () => {
  const [items, setItems] = useState<PhilatelyItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhilatelyItem | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('createdAt_desc');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const generateDummies = (count: number) => {
      const types = Object.values(ItemType);
      const continents = Object.values(Continent);
      const conditions = Object.values(ItemCondition);
      
      return Array.from({ length: count }).map((_, i) => ({
        id: `dummy-${i}`,
        type: types[i % types.length],
        country: ['Brasil', 'Portugal', 'Angola', 'França', 'Japão', 'EUA', 'Cabo Verde'][i % 7],
        continent: continents[i % continents.length],
        date: (1850 + (i * 5)).toString(),
        value: `${(i + 1) * 10}`,
        theme: 'História',
        condition: conditions[i % conditions.length],
        notes: `Item de teste número ${i + 1}.`,
        imageFront: `https://picsum.photos/seed/front-${i}/300/300`,
        imageBack: `https://picsum.photos/seed/back-${i}/300/300`,
        createdAt: Date.now() - (i * 1000 * 60 * 60 * 24)
      }));
    };

    const initialItems: PhilatelyItem[] = [
      {
        id: '1',
        type: ItemType.STAMP,
        country: 'Brasil',
        continent: Continent.AMERICAS,
        date: '1843',
        value: '30',
        theme: 'História',
        condition: ItemCondition.MINT,
        notes: 'Famoso selo Olho de Boi. Primeiro selo postal das Américas.',
        imageFront: 'https://picsum.photos/seed/stamp1/300/300',
        imageBack: 'https://picsum.photos/seed/stamp1b/300/300',
        createdAt: Date.now()
      },
      ...generateDummies(40)
    ];
    setItems(initialItems);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [items, filter, selectedContinent, sortBy]);

  useEffect(() => {
    if (items.length > 0) {
      const getInsight = async () => {
        const insight = await analyzeCollection(items);
        setAiInsight(insight);
      };
      getInsight();
    }
  }, [items]);

  const handleSaveItem = (item: PhilatelyItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i);
      }
      return [item, ...prev];
    });
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleEditItem = (item: PhilatelyItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const sortedAndFilteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesText = item.country.toLowerCase().includes(filter.toLowerCase()) || 
                        item.theme.toLowerCase().includes(filter.toLowerCase()) ||
                        item.notes.toLowerCase().includes(filter.toLowerCase());
      const matchesContinent = !selectedContinent || item.continent === selectedContinent;
      return matchesText && matchesContinent;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_desc': return b.createdAt - a.createdAt;
        case 'createdAt_asc': return a.createdAt - b.createdAt;
        case 'country_asc': return a.country.localeCompare(b.country);
        case 'country_desc': return b.country.localeCompare(a.country);
        case 'value_asc': {
          const valA = parseFloat(a.value) || 0;
          const valB = parseFloat(b.value) || 0;
          return valA - valB;
        }
        case 'value_desc': {
          const valA = parseFloat(a.value) || 0;
          const valB = parseFloat(b.value) || 0;
          return valB - valA;
        }
        default: return 0;
      }
    });

    return result;
  }, [items, filter, selectedContinent, sortBy]);

  const displayedItems = sortedAndFilteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAndFilteredItems.length;

  return (
    <Layout>
      <div className="space-y-12 animate-in fade-in duration-700">
        <section id="dashboard" className="scroll-mt-24">
          <h2 className="text-3xl font-bold text-white mb-2">Olá, Colecionador</h2>
          <p className="text-slate-400">Gerencie seu acervo de 5 continentes com precisão e estilo.</p>
        </section>

        {aiInsight && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 group shadow-[0_0_30px_rgba(34,211,238,0.05)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-xl shadow-inner border border-cyan-500/20">
                ✨
              </div>
              <div>
                <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest block mb-0.5">IA Insight</span>
                <p className="text-sm text-cyan-100/90 italic font-medium">{aiInsight}</p>
              </div>
            </div>
            <button 
              onClick={() => setSortBy('createdAt_desc')}
              className="w-full md:w-auto text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500 hover:text-slate-950 transition-all uppercase tracking-widest shadow-lg"
            >
              Aplicar Ordenação Inteligente
            </button>
          </div>
        )}

        <div id="stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-mt-24">
          <CollectionStats items={items} />
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="flex-1 group relative bg-cyan-600/5 border-2 border-dashed border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:bg-cyan-600/15 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(34,211,238,0.15)]"
            >
              <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-slate-950 neon-glow transition-all group-hover:scale-110 group-hover:rotate-6 shadow-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <span className="block text-white font-black text-lg uppercase tracking-tight">Novo Registro</span>
                <span className="block text-cyan-400/60 text-[10px] uppercase tracking-widest font-black mt-1">Manual ou Foto</span>
              </div>
            </button>

            <button 
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="group bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0111 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-white uppercase tracking-widest">Scanner de IA</span>
                  <span className="block text-[8px] text-slate-500 uppercase font-black">Importação Inteligente</span>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <section id="collection" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full group">
              <input 
                type="text" 
                placeholder="Pesquisar por país, tema ou notas..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-14 py-4 focus:border-cyan-500/50 focus:bg-slate-900 outline-none transition-all text-slate-200 placeholder-slate-600"
                value={filter}
                onChange={e => {
                  setFilter(e.target.value);
                  setVisibleCount(10);
                }}
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full no-scrollbar p-1">
                {Object.values(Continent).map(c => (
                  <button 
                    key={c}
                    onClick={() => {
                      setSelectedContinent(selectedContinent === c ? null : c);
                      setVisibleCount(10);
                    }}
                    className={`px-5 py-2.5 rounded-xl whitespace-nowrap border text-[11px] font-black uppercase tracking-widest transition-all ${
                      selectedContinent === c 
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 neon-glow shadow-lg' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <select 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 outline-none focus:border-cyan-500 appearance-none transition-all cursor-pointer hover:bg-slate-900"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortMode);
                    setVisibleCount(10);
                  }}
                >
                  <option value="createdAt_desc">Recentes</option>
                  <option value="createdAt_asc">Antigos</option>
                  <option value="country_asc">País (A-Z)</option>
                  <option value="country_desc">País (Z-A)</option>
                  <option value="value_desc">Valor Max</option>
                  <option value="value_asc">Valor Min</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {displayedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onDelete={handleDeleteItem} 
                onEdit={handleEditItem}
                onUpdate={handleSaveItem}
              />
            ))}
            
            {sortedAndFilteredItems.length === 0 && (
              <div className="col-span-full py-24 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-5xl opacity-30">
                  📂
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Vazio por aqui</h3>
                  <p className="text-slate-600 max-w-xs mx-auto text-sm">Nenhum item corresponde à sua busca ou filtros. Tente redefinir os parâmetros.</p>
                </div>
                <button 
                  onClick={() => { setFilter(''); setSelectedContinent(null); }}
                  className="text-cyan-500 font-bold uppercase tracking-widest text-[10px] hover:underline"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>

          {hasMore && (
            <div 
              ref={loaderRef} 
              className="w-full py-16 flex flex-col items-center justify-center gap-4 border-t border-slate-900 mt-8"
            >
              <div className="w-8 h-8 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-[10px] text-cyan-500/40 uppercase tracking-[0.3em] font-black animate-pulse">
                Carregando mais itens da sua coleção...
              </p>
            </div>
          )}
          
          {!hasMore && sortedAndFilteredItems.length > 0 && (
            <div className="w-full py-16 text-center border-t border-slate-900 mt-8">
              <p className="text-[10px] text-slate-700 uppercase tracking-[0.5em] font-black">
                Fim do arquivo • {sortedAndFilteredItems.length} itens registrados
              </p>
            </div>
          )}
        </section>
      </div>

      {isFormOpen && (
        <ItemForm 
          onSave={handleSaveItem} 
          onCancel={handleCloseForm} 
          initialData={editingItem}
        />
      )}
    </Layout>
  );
};

export default App;
