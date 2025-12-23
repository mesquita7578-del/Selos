
import React from 'react';
import { Continent } from '../types';

interface WorldMapProps {
  data: Record<string, number>;
  selectedContinent: string | null;
  onSelect: (continent: string | null) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, selectedContinent, onSelect }) => {
  const continents = [
    { id: Continent.AMERICAS, label: 'Américas', path: 'M30,20 L50,20 L50,80 L20,80 Z', color: '#06b6d4' },
    { id: Continent.EUROPE, label: 'Europa', path: 'M55,15 L75,15 L75,35 L55,35 Z', color: '#22d3ee' },
    { id: Continent.AFRICA, label: 'África', path: 'M55,40 L75,40 L75,70 L55,70 Z', color: '#0891b2' },
    { id: Continent.ASIA, label: 'Ásia', path: 'M80,10 L120,10 L120,60 L80,60 Z', color: '#0ea5e9' },
    { id: Continent.OCEANIA, label: 'Oceania', path: 'M100,70 L130,70 L130,90 L100,90 Z', color: '#67e8f9' }
  ];

  return (
    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center">
      <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Exploração Continental</h4>
      <div className="relative w-full aspect-[2/1] max-w-[300px]">
        <svg viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">
          {continents.map((c) => {
            const count = data[c.id] || 0;
            const isActive = selectedContinent === c.id;
            return (
              <path
                key={c.id}
                d={c.path}
                fill={isActive ? c.color : '#1e293b'}
                className="transition-all duration-500 cursor-pointer hover:opacity-80"
                onClick={() => onSelect(isActive ? null : c.id)}
                stroke={isActive ? '#fff' : '#334155'}
                strokeWidth={isActive ? '1' : '0.5'}
              >
                <title>{c.label}: {count} itens</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {continents.map(c => (
          <div key={c.id} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data[c.id] ? c.color : '#334155' }}></div>
            <span className="text-[8px] font-bold text-slate-500 uppercase">{data[c.id] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
