
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PhilatelyItem } from '../types';

interface StatsProps {
  items: PhilatelyItem[];
}

const CollectionStats: React.FC<StatsProps> = ({ items }) => {
  const continentData = items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.continent);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.continent, value: 1 });
    }
    return acc;
  }, []);

  const typeData = items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.type, value: 1 });
    }
    return acc;
  }, []);

  const PIE_COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

  return (
    <>
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center min-h-[180px]">
        <h4 className="text-slate-500 uppercase tracking-widest text-xs mb-2 font-bold">Total de Itens</h4>
        <p className="text-5xl font-bold text-white neon-text">{items.length}</p>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tighter">Capacidade: 10.000 imagens</p>
      </div>

      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 min-h-[180px]">
        <h4 className="text-slate-500 uppercase tracking-widest text-[10px] mb-4 text-center font-bold">Distribuição Geográfica</h4>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={continentData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
              >
                {continentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: '#22d3ee' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 min-h-[180px]">
        <h4 className="text-slate-500 uppercase tracking-widest text-[10px] mb-4 text-center font-bold">Tipos de Acervo</h4>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                 cursor={{ fill: 'rgba(34, 211, 238, 0.05)' }}
                 contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
              />
              <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default CollectionStats;
