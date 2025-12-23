
import React, { useState } from 'react';
import { PhilatelyItem } from '../types';

interface ItemCardProps {
  item: PhilatelyItem;
  onDelete: (id: string) => void;
  onEdit: (item: PhilatelyItem) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, onEdit }) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
      <div className="relative aspect-square overflow-hidden bg-slate-800 flex items-center justify-center p-2 cursor-pointer" onClick={() => setShowBack(!showBack)}>
        <img 
          src={showBack ? item.imageBack : item.imageFront} 
          alt={item.country} 
          className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-slate-950/80 text-xs px-2 py-1 rounded text-cyan-400 border border-cyan-900/50">
          {showBack ? 'Verso' : 'Frente'}
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
  );
};

export default ItemCard;
