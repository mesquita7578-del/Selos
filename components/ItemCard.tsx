
import React, { useState, useEffect, useCallback } from 'react';
import { PhilatelyItem } from '../types';

interface ItemCardProps {
  item: PhilatelyItem;
  onDelete: (id: string) => void;
  onEdit: (item: PhilatelyItem) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, onEdit }) => {
  const [showBack, setShowBack] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Close zoom on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsZoomed(false);
  }, []);

  useEffect(() => {
    if (isZoomed) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, handleKeyDown]);

  return (
    <>
      <div className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        <div className="relative aspect-square overflow-hidden bg-slate-800 flex items-center justify-center p-2">
          <img 
            src={showBack ? item.imageBack : item.imageFront} 
            alt={`${item.country} - ${showBack ? 'Verso' : 'Frente'}`} 
            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 cursor-pointer"
            onClick={() => setShowBack(!showBack)}
          />
          
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <div className="bg-slate-950/80 text-[10px] px-2 py-1 rounded text-cyan-400 border border-cyan-900/50 font-bold uppercase tracking-tighter">
              {showBack ? 'Verso' : 'Frente'}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
              className="bg-cyan-500 text-slate-950 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
              title="Zoom Acessível"
              aria-label="Abrir visualização ampliada"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{item.type}</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/30 font-bold">{item.condition}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 truncate">{item.country}</h3>
          <p className="text-sm text-slate-400 mb-3">{item.theme} • {item.date}</p>
          
          <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
            <span className="text-cyan-400 font-semibold">{item.value}</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onEdit(item)}
                className="text-slate-600 hover:text-cyan-400 transition-colors"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                onClick={() => onDelete(item.id)}
                className="text-slate-600 hover:text-red-400 transition-colors"
                title="Excluir"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zoom-title"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-800">
            <div>
              <h2 id="zoom-title" className="text-xl font-bold neon-text">{item.country} <span className="text-slate-500 font-light">| {item.date}</span></h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{item.type} - {item.theme}</p>
            </div>
            <button 
              onClick={() => setIsZoomed(false)}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-3xl"
              aria-label="Fechar zoom"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <img 
              src={showBack ? item.imageBack : item.imageFront} 
              alt={`${item.country} ampliado`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-cyan-500/30 animate-in zoom-in-90 duration-300"
            />
            
            {/* Overlay controls for easier accessibility */}
            <div className="absolute inset-x-0 bottom-12 flex justify-center gap-4">
              <button 
                onClick={() => setShowBack(false)}
                className={`px-6 py-2 rounded-full font-bold transition-all border ${!showBack ? 'bg-cyan-500 text-slate-950 border-cyan-400 neon-glow scale-105' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
              >
                FRENTE
              </button>
              <button 
                onClick={() => setShowBack(true)}
                className={`px-6 py-2 rounded-full font-bold transition-all border ${showBack ? 'bg-cyan-500 text-slate-950 border-cyan-400 neon-glow scale-105' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
              >
                VERSO
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-900/50 border-t border-slate-800 max-h-[25vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-2">
              <h4 className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em]">Notas do Arquivo</h4>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {item.notes || "Sem notas detalhadas para este item."}
              </p>
              <div className="flex gap-4 pt-2">
                <span className="text-[10px] text-slate-500"><b className="text-slate-400">Estado:</b> {item.condition}</span>
                <span className="text-[10px] text-slate-500"><b className="text-slate-400">Valor:</b> {item.value}</span>
                <span className="text-[10px] text-slate-500"><b className="text-slate-400">Continente:</b> {item.continent}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemCard;
