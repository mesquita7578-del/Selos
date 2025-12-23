
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
  
  // Pagination / Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Initialize dummy data
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

  // Infinite Scroll Observer
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
      <div className="space-y-8 animate-in fade-in duration-700">
        <section>
          <h2 className="text-3xl font-bold text-white mb-2">Olá, Colecionador</h2>
          <p className="text-slate-400">Gerencie seu acervo de 5 continentes com precisão e estilo.</p>
        </section>

        {aiInsight && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-xl flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <p className="text-sm text-cyan-200/80 italic">{aiInsight}</p>
            </div>
            <button 
              onClick={() => setSortBy('createdAt_desc')}
              className="hidden md:block text-[10px] text-cyan-400 border border-cyan-900/50 px-2 py-1 rounded hover:bg-cyan-500 hover:text-slate-950 transition-all uppercase tracking-tighter"
            >
              Aplicar Ordenação Inteligente
            </button>
          </div>
        )}

        {/* Dashboard Row: Stats + New Item Trigger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <CollectionStats items={items} />
          
          <button 
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="group relative bg-cyan-600/10 border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:bg-cyan-600/20 hover:border-cyan-500 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
          >
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-slate-950 neon-glow transition-transform group-hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-white font-bold text-lg">Novo Registro</span>
              <span className="block text-cyan-400/60 text-[10px] uppercase tracking-widest font-bold">Adicionar ao Acervo</span>
            </div>
          </button>
        </div>

        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                placeholder="Pesquisar por país, tema ou notas..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 focus:border-cyan-500 outline-none transition-all"
                value={filter}
                onChange={e => {
                  setFilter(e.target.value);
                  setVisibleCount(10);
                }}
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full no-scrollbar">
                {Object.values(Continent).map(c => (
                  <button 
                    key={c}
                    onClick={() => {
                      setSelectedContinent(selectedContinent === c ? null : c);
                      setVisibleCount(10);
                    }}
                    className={`px-4 py-2 rounded-full whitespace-nowrap border text-[11px] font-bold transition-all ${
                      selectedContinent === c 
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 neon-glow' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-48">
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500 appearance-none transition-all cursor-pointer"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortMode);
                    setVisibleCount(10);
                  }}
                >
                  <option value="createdAt_desc">Data (Mais Recentes)</option>
                  <option value="createdAt_asc">Data (Mais Antigos)</option>
                  <option value="country_asc">País (A-Z)</option>
                  <option value="country_desc">País (Z-A)</option>
                  <option value="value_desc">Valor (Maior)</option>
                  <option value="value_asc">Valor (Menor)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onDelete={handleDeleteItem} 
                onEdit={handleEditItem}
              />
            ))}
            
            {sortedAndFilteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-6xl grayscale opacity-20">📂</div>
                <h3 className="text-xl font-semibold text-slate-500">Nenhum item encontrado</h3>
                <p className="text-slate-600">Tente ajustar seus filtros ou adicione um novo registro.</p>
              </div>
            )}
          </div>

          {hasMore && (
            <div 
              ref={loaderRef} 
              className="w-full py-12 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-xs text-cyan-500/50 uppercase tracking-widest font-bold animate-pulse">
                Carregando mais itens da sua coleção...
              </p>
            </div>
          )}
          
          {!hasMore && sortedAndFilteredItems.length > 0 && (
            <div className="w-full py-12 text-center">
              <p className="text-xs text-slate-600 uppercase tracking-widest">
                Fim do arquivo ({sortedAndFilteredItems.length} itens exibidos)
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
