
import React, { useState, useEffect, useCallback } from 'react';
import { PhilatelyItem } from '../types';
import { detectVisualElements, evaluateMarketPrice } from '../services/geminiService';

interface ItemCardProps {
  item: PhilatelyItem;
  onDelete: (id: string) => void;
  onEdit: (item: PhilatelyItem) => void;
  onUpdate?: (item: PhilatelyItem) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, onEdit, onUpdate }) => {
  const [showBack, setShowBack] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingMarket, setIsCheckingMarket] = useState(false);
  const [marketData, setMarketData] = useState<{ summary: string, sources: any[] } | null>(null);
  const [highlights, setHighlights] = useState<any[]>([]);

  const handleAIScan = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsScanning(true);
    const result = await detectVisualElements(showBack ? item.imageBack : item.imageFront);
    setHighlights(result.elements || []);
    setIsScanning(false);
  };

  const handleMarketCheck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCheckingMarket(true);
    const data = await evaluateMarketPrice(item);
    setMarketData(data);
    setIsCheckingMarket(false);
  };

  return (
    <>
      <div className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        <div className="relative aspect-square overflow-hidden bg-slate-800 flex items-center justify-center p-2">
          <img 
            src={showBack ? item.imageBack : item.imageFront} 
            className="max-w-full max-h-full object-contain cursor-pointer transition-all duration-500 group-hover:scale-105"
            onClick={() => setShowBack(!showBack)}
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
             <button onClick={handleMarketCheck} disabled={isCheckingMarket} className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg shadow-lg hover:scale-110 transition-all">
                {isCheckingMarket ? <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.184a4.535 4.535 0 00-1.676.662C6.602 13.234 6 14.009 6 15c0 .99.602 1.765 1.324 2.246A4.535 4.535 0 009 17.908V19a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 17.766 14 16.991 14 16c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 13.092v-1.184a4.535 4.535 0 001.676-.662C13.398 10.766 14 9.991 14 9c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 6.092V5z" clipRule="evenodd" /></svg>}
             </button>
             <button onClick={(e) => {e.stopPropagation(); setIsZoomed(true);}} className="bg-cyan-500 text-slate-950 p-1.5 rounded-lg shadow-lg hover:scale-110 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
             </button>
          </div>
          {isScanning && <div className="absolute inset-0 bg-cyan-500/10"><div className="w-full h-1 bg-cyan-400 absolute animate-scan-laser shadow-[0_0_10px_#22d3ee]"></div></div>}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">{item.continent}</span>
            <span className="text-[9px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/30 font-bold">{item.condition}</span>
          </div>
          <h3 className="text-md font-bold text-slate-100 truncate">{item.country}</h3>
          <p className="text-xs text-slate-400 truncate">{item.theme} • {item.date}</p>
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800/50">
            <span className="text-cyan-400 font-black text-sm">{item.value}</span>
            <div className="flex gap-2">
              <button onClick={() => onEdit(item)} className="text-slate-600 hover:text-cyan-400 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
              <button onClick={() => onDelete(item.id)} className="text-slate-600 hover:text-red-400 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          </div>
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-[110] bg-slate-950/98 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold neon-text">{item.country} <span className="text-slate-500">| {item.date}</span></h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">{item.type} - {item.theme}</p>
            </div>
            <button onClick={() => setIsZoomed(false)} className="text-3xl text-slate-400 hover:text-white transition-colors">&times;</button>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row gap-8 py-8 overflow-hidden">
             <div className="flex-1 relative bg-slate-900 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
                <img src={showBack ? item.imageBack : item.imageFront} className="max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                <div className="absolute bottom-6 flex gap-2">
                  <button onClick={() => setShowBack(false)} className={`px-4 py-1 text-[10px] font-black rounded-full border transition-all ${!showBack ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>FRENTE</button>
                  <button onClick={() => setShowBack(true)} className={`px-4 py-1 text-[10px] font-black rounded-full border transition-all ${showBack ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>VERSO</button>
                </div>
             </div>
             <div className="w-full lg:w-96 space-y-6 overflow-y-auto pr-4">
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                   <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3">Avaliação de Mercado</h4>
                   {marketData ? (
                     <div className="space-y-4">
                        <p className="text-xs text-slate-300 leading-relaxed italic">{marketData.summary}</p>
                        <div className="flex flex-wrap gap-2">
                           {marketData.sources.map((s, i) => s.web && (
                             <a key={i} href={s.web.uri} target="_blank" className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-cyan-400 hover:border-cyan-500 transition-all">{s.web.title || 'Ver Fonte'}</a>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <button onClick={handleMarketCheck} disabled={isCheckingMarket} className="w-full py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-slate-950 transition-all">
                        {isCheckingMarket ? 'Consultando IA...' : 'Analisar Valor de Mercado'}
                     </button>
                   )}
                </div>
                <div className="space-y-2">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalhes do Arquivo</h4>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800"><span className="text-[9px] text-slate-500 block">PAÍS</span><span className="text-xs font-bold">{item.country}</span></div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800"><span className="text-[9px] text-slate-500 block">ANO</span><span className="text-xs font-bold">{item.date}</span></div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800"><span className="text-[9px] text-slate-500 block">ESTADO</span><span className="text-xs font-bold">{item.condition}</span></div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800"><span className="text-[9px] text-slate-500 block">TEMA</span><span className="text-xs font-bold">{item.theme}</span></div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded border border-slate-800 mt-4">
                      <span className="text-[9px] text-slate-500 block mb-1">NOTAS TÉCNICAS</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.notes || 'Sem notas adicionais.'}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes scan-laser { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan-laser { animation: scan-laser 2s linear infinite; }
      `}</style>
    </>
  );
};

export default ItemCard;
