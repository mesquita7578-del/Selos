
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import ItemCard from './components/ItemCard';
import CollectionStats from './components/CollectionStats';
import ItemForm from './components/ItemForm';
import { PhilatelyItem, Continent, ItemType, ItemCondition } from './types';
import { analyzeCollection } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<PhilatelyItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Initialize dummy data
  useEffect(() => {
    const initialItems: PhilatelyItem[] = [
      {
        id: '1',
        type: ItemType.STAMP,
        country: 'Brasil',
        continent: Continent.AMERICAS,
        date: '1843',
        value: '30 Réis',
        theme: 'História',
        condition: ItemCondition.MINT,
        notes: 'Famoso selo Olho de Boi. Primeiro selo postal das Américas.',
        imageFront: 'https://picsum.photos/seed/stamp1/300/300',
        imageBack: 'https://picsum.photos/seed/stamp1b/300/300',
        createdAt: Date.now()
      },
      {
        id: '2',
        type: ItemType.STAMP,
        country: 'Portugal',
        continent: Continent.EUROPE,
        date: '1853',
        value: '5 Reis',
        theme: 'Personalidades',
        condition: ItemCondition.USADO,
        notes: 'D. Maria II, emissão clichê em metal.',
        imageFront: 'https://picsum.photos/seed/stamp2/300/300',
        imageBack: 'https://picsum.photos/seed/stamp2b/300/300',
        createdAt: Date.now()
      },
      {
        id: '3',
        type: ItemType.POSTCARD,
        country: 'Angola',
        continent: Continent.AFRICA,
        date: '1960',
        value: 'N/A',
        theme: 'Natureza',
        condition: ItemCondition.NOVO,
        notes: 'Vista panorâmica de Luanda.',
        imageFront: 'https://picsum.photos/seed/card1/300/300',
        imageBack: 'https://picsum.photos/seed/card1b/300/300',
        createdAt: Date.now()
      }
    ];
    setItems(initialItems);
  }, []);

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
    setItems(prev => [item, ...prev]);
    setIsFormOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filteredItems = items.filter(item => {
    const matchesText = item.country.toLowerCase().includes(filter.toLowerCase()) || 
                      item.theme.toLowerCase().includes(filter.toLowerCase());
    const matchesContinent = !selectedContinent || item.continent === selectedContinent;
    return matchesText && matchesContinent;
  });

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Olá, Colecionador</h2>
            <p className="text-slate-400">Gerencie seu acervo de 5 continentes com precisão e estilo.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all neon-glow flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Novo Registro
          </button>
        </section>

        {aiInsight && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-xl flex items-center gap-3">
            <span className="text-xl">✨</span>
            <p className="text-sm text-cyan-200/80 italic">{aiInsight}</p>
          </div>
        )}

        <CollectionStats items={items} />

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                placeholder="Pesquisar por país ou tema..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 focus:border-cyan-500 outline-none transition-all"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {Object.values(Continent).map(c => (
                <button 
                  key={c}
                  onClick={() => setSelectedContinent(selectedContinent === c ? null : c)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border text-xs font-semibold transition-all ${
                    selectedContinent === c 
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950 neon-glow' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-6xl grayscale opacity-20">📂</div>
                <h3 className="text-xl font-semibold text-slate-500">Nenhum item encontrado</h3>
                <p className="text-slate-600">Tente ajustar seus filtros ou adicione um novo registro.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {isFormOpen && (
        <ItemForm 
          onSave={handleSaveItem} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}
    </Layout>
  );
};

export default App;
