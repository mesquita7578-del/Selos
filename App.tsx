
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Detectar prompt de instalação PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const saved = localStorage.getItem('phila_collection');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar do localStorage", e);
      }
    } else {
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
        }
      ];
      setItems(initialItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('phila_collection', JSON.stringify(items));
    if (items.length > 0) {
      const getInsight = async () => {
        const insight = await analyzeCollection(items);
        setAiInsight(insight);
      };
      getInsight();
    }
  }, [items]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => { if (loaderRef.current) observer.unobserve(loaderRef.current); };
  }, [items, filter, selectedContinent, sortBy]);

  const handleOpenNewForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenScanForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleExportJson = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `acervo_filatelico_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [items]);

  const handleImportJson = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInstallApp = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("Para descarregar no PC:\n\n1. Use o Chrome ou Edge\n2. Clique no ícone de 'Instalar' na barra de endereços (ao lado da estrela de favoritos)\n3. Ou vá em Menu (...) > Instalar PhilaArchive Neon");
    }
  }, [deferredPrompt]);

  const onFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setItems(json);
          alert(`Sucesso! ${json.length} itens importados.`);
        } else {
          alert("Formato de arquivo JSON inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveItem = (item: PhilatelyItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? item : i);
      return [item, ...prev];
    });
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleEditItem = (item: PhilatelyItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
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
        case 'value_asc': return (parseFloat(a.value) || 0) - (parseFloat(b.value) || 0);
        case 'value_desc': return (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0);
        default: return 0;
      }
    });
    return result;
  }, [items, filter, selectedContinent, sortBy]);

  const displayedItems = sortedAndFilteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAndFilteredItems.length;

  return (
    <Layout 
      onNewClick={handleOpenNewForm} 
      onScanClick={handleOpenScanForm} 
      onExportJson={handleExportJson}
      onImportJson={handleImportJson}
      onInstallApp={handleInstallApp}
      showInstallBtn={!!deferredPrompt}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={onFileImport} 
      />
      
      <div className="space-y-12 animate-in fade-in duration-700">
        <section id="dashboard" className="scroll-mt-24">
          <h2 className="text-3xl font-bold text-white mb-2">Olá, Colecionador</h2>
          <p className="text-slate-400">Gerencie seu acervo de 5 continentes com comandos JSON, IA e APP Desktop.</p>
        </section>

        {aiInsight && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 group shadow-[0_0_30px_rgba(34,211,238,0.05)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-xl shadow-inner border border-cyan-500/20">✨</div>
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
            <button onClick={handleOpenNewForm} className="flex-1 group relative bg-cyan-600/5 border-2 border-dashed border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:bg-cyan-600/15 hover:border-cyan-400">
              <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-slate-950 neon-glow transition-all group-hover:scale-110 shadow-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </div>
              <div className="text-center">
                <span className="block text-white font-black text-lg uppercase tracking-tight">Novo Registro</span>
                <span className="block text-cyan-400/60 text-[10px] uppercase tracking-widest font-black mt-1">Manual ou Foto</span>
              </div>
            </button>
            <button onClick={handleOpenScanForm} className="group bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between hover:border-cyan-500/50 transition-all shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0111 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                </div>
                <div className="text-left">
                  <span className="block text-xs font-black text-white uppercase tracking-widest">Scanner de IA</span>
                  <span className="block text-[8px] text-slate-500 uppercase font-black">Importação Inteligente</span>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-500 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <section id="collection" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full group">
              <input 
                type="text" 
                placeholder="Pesquisar por país, tema ou notas..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-14 py-4 focus:border-cyan-500/50 outline-none transition-all text-slate-200"
                value={filter}
                onChange={e => { setFilter(e.target.value); setVisibleCount(10); }}
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full no-scrollbar p-1">
                {Object.values(Continent).map(c => (
                  <button key={c} onClick={() => { setSelectedContinent(selectedContinent === c ? null : c); setVisibleCount(10); }} className={`px-5 py-2.5 rounded-xl whitespace-nowrap border text-[11px] font-black uppercase tracking-widest transition-all ${selectedContinent === c ? 'bg-cyan-500 border-cyan-400 text-slate-950 neon-glow' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <select 
                className="w-full sm:w-56 bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 outline-none appearance-none"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortMode); setVisibleCount(10); }}
              >
                <option value="createdAt_desc">Recentes</option>
                <option value="createdAt_asc">Antigos</option>
                <option value="country_asc">País (A-Z)</option>
                <option value="country_desc">País (Z-A)</option>
                <option value="value_desc">Valor Max</option>
                <option value="value_asc">Valor Min</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {displayedItems.map(item => (
              <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} onEdit={handleEditItem} onUpdate={handleSaveItem} />
            ))}
          </div>

          {hasMore && <div ref={loaderRef} className="w-full py-16 flex flex-col items-center justify-center gap-4"><div className="w-8 h-8 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div></div>}
        </section>
      </div>

      {isFormOpen && <ItemForm onSave={handleSaveItem} onCancel={handleCloseForm} initialData={editingItem} />}
    </Layout>
  );
};

export default App;
