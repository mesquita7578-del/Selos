
import React, { useState, useEffect, useCallback } from 'react';
import { PhilatelyItem } from '../types';
import { detectVisualElements } from '../services/geminiService';

interface ItemCardProps {
  item: PhilatelyItem;
  onDelete: (id: string) => void;
  onEdit: (item: PhilatelyItem) => void;
  onUpdate?: (item: PhilatelyItem) => void;
}

interface VisualHighlight {
  label: string;
  x: number;
  y: number;
  description: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, onEdit, onUpdate }) => {
  const [showBack, setShowBack] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [highlights, setHighlights] = useState<VisualHighlight[]>([]);
  const [themeUpdated, setThemeUpdated] = useState(false);

  // Close zoom on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsZoomed(false);
      setHighlights([]);
    }
  }, []);

  useEffect(() => {
    if (isZoomed) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      setHighlights([]);
      setIsScanning(false);
      setThemeUpdated(false);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, handleKeyDown]);

  const handleAIScan = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setIsScanning(true);
    setHighlights([]);
    setThemeUpdated(false);
    
    const currentImage = showBack ? item.imageBack : item.imageFront;
    const result = await detectVisualElements(currentImage);
    
    setHighlights(result.elements);
    
    // Auto-update theme if AI suggests a more precise one
    if (result.suggestedTheme && result.suggestedTheme.toLowerCase() !== item.theme.toLowerCase() && onUpdate) {
      const updatedItem = { ...item, theme: result.suggestedTheme };
      onUpdate(updatedItem);
      setThemeUpdated(true);
      // Fade out the notification after 5 seconds
      setTimeout(() => setThemeUpdated(false), 5000);
    }
    
    setIsScanning(false);
  };

  return (
    <>
      <div className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        {/* Main Image View */}
        <div className="relative aspect-square overflow-hidden bg-slate-800 flex items-center justify-center p-2">
          <img 
            src={showBack ? item.imageBack : item.imageFront} 
            alt={`${item.country} - ${showBack ? 'Verso' : 'Frente'}`} 
            className={`max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-105 cursor-pointer ${isScanning ? 'brightness-50 grayscale' : ''}`}
            onClick={() => setShowBack(!showBack)}
          />
          
          {/* Scanning Animation for Card */}
          {isScanning && !isZoomed && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee] absolute animate-scan-laser"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Theme Updated Alert for Card */}
          {themeUpdated && !isZoomed && (
            <div className="absolute inset-x-0 top-0 bg-cyan-500 text-slate-900 text-[9px] font-black py-1 text-center uppercase tracking-widest animate-in slide-in-from-top duration-300">
              Tema Atualizado pela IA
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <div className="bg-slate-950/80 text-[10px] px-2 py-1 rounded text-cyan-400 border border-cyan-900/50 font-bold uppercase tracking-tighter">
              {showBack ? 'Verso' : 'Frente'}
            </div>
            
            {/* Quick Action Button (Lightning Bolt) */}
            <button 
              onClick={handleAIScan}
              disabled={isScanning}
              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg border border-cyan-500/30 ${isScanning ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'}`}
              title="Ação Rápida: Analisar com IA"
              aria-label="Ação rápida por inteligência artificial"
            >
              <svg className={`w-4 h-4 ${isScanning ? '' : 'animate-pulse'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0111 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </button>

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
          {/* Notifications area */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-2">
            {themeUpdated && (
              <div className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-bounce flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                TEMA ATUALIZADO PELA IA: <span className="uppercase">{item.theme}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-6 border-b border-slate-800">
            <div>
              <h2 id="zoom-title" className="text-xl font-bold neon-text">{item.country} <span className="text-slate-500 font-light">| {item.date}</span></h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{item.type} - {item.theme}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleAIScan}
                disabled={isScanning}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${isScanning ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 neon-glow'}`}
              >
                {isScanning ? (
                  <>
                    <div className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                    ESCANER IA ATIVO...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    IDENTIFICAR E CLASSIFICAR (IA)
                  </>
                )}
              </button>
              <button 
                onClick={() => { setIsZoomed(false); setHighlights([]); }}
                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-3xl"
                aria-label="Fechar zoom"
              >
                &times;
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/10 via-transparent to-transparent">
            <div className="relative max-w-full max-h-full">
              <img 
                src={showBack ? item.imageBack : item.imageFront} 
                alt={`${item.country} ampliado`}
                className={`max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl ring-1 ring-cyan-500/30 animate-in zoom-in-90 duration-300 ${isScanning ? 'brightness-50 grayscale transition-all duration-700' : ''}`}
              />
              
              {/* Highlights Layer */}
              {highlights.map((h, i) => (
                <div 
                  key={i}
                  className="absolute z-20 group/mark"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_#22d3ee] flex items-center justify-center relative">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-slate-900 border border-cyan-500/50 p-2 rounded-lg opacity-0 group-hover/mark:opacity-100 transition-opacity pointer-events-none shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] text-cyan-400 font-black uppercase mb-1 tracking-tighter">{h.label}</p>
                      <p className="text-xs text-white leading-tight">{h.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                  <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] absolute animate-scan-laser"></div>
                </div>
              )}
            </div>
            
            {/* Overlay controls for easier accessibility */}
            <div className="absolute inset-x-0 bottom-12 flex justify-center gap-4">
              <button 
                onClick={() => { setShowBack(false); setHighlights([]); }}
                className={`px-6 py-2 rounded-full font-bold transition-all border ${!showBack ? 'bg-cyan-500 text-slate-950 border-cyan-400 neon-glow scale-105' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
              >
                FRENTE
              </button>
              <button 
                onClick={() => { setShowBack(true); setHighlights([]); }}
                className={`px-6 py-2 rounded-full font-bold transition-all border ${showBack ? 'bg-cyan-500 text-slate-950 border-cyan-400 neon-glow scale-105' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
              >
                VERSO
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-900/50 border-t border-slate-800 max-h-[25vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-4">
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-bottom-2">
                  <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest block w-full mb-1">Mapeamento Visual:</span>
                  {highlights.map((h, i) => (
                    <div key={i} className="px-3 py-1 bg-cyan-950/30 border border-cyan-900/50 rounded-full flex items-center gap-2">
                      <span className="text-[9px] font-black text-cyan-500">{h.label}:</span>
                      <span className="text-[11px] text-cyan-100">{h.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h4 className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-1">Notas do Arquivo</h4>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  {item.notes || "Sem notas detalhadas para este item."}
                </p>
              </div>
              
              <div className="flex gap-4 pt-2">
                <span className="text-[10px] text-slate-500"><b className="text-slate-400 uppercase tracking-tighter">Estado:</b> {item.condition}</span>
                <span className="text-[10px] text-slate-500"><b className="text-slate-400 uppercase tracking-tighter">Valor:</b> {item.value}</span>
                <span className="text-[10px] text-slate-500"><b className="text-slate-400 uppercase tracking-tighter">Continente:</b> {item.continent}</span>
                <span className="text-[10px] text-slate-500"><b className="text-slate-400 uppercase tracking-tighter">Tema:</b> {item.theme}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan-laser {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-laser {
          animation: scan-laser 2s linear infinite;
        }
      `}</style>
    </>
  );
};

export default ItemCard;
