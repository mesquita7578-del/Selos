
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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

  const conditionData = items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.condition);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.condition, value: 1 });
    }
    return acc;
  }, []);

  const PIE_COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

  return (
    <>
      <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
        <h4 className="text-slate-500 uppercase tracking-widest text-xs mb-4 font-black">Inventário Total</h4>
        <p className="text-7xl font-black text-white neon-text">{items.length}</p>
        <div className="mt-6 flex gap-4">
          <div className="text-center">
            <span className="block text-slate-500 text-[9px] font-black uppercase">Capacidade</span>
            <span className="text-cyan-500 font-bold">10.000</span>
          </div>
          <div className="text-center">
            <span className="block text-slate-500 text-[9px] font-black uppercase">Uso</span>
            <span className="text-white font-bold">{((items.length / 10000) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800">
        <h4 className="text-slate-500 uppercase tracking-widest text-[10px] mb-6 text-center font-black">Distribuição por Continente</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={continentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {continentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800">
        <h4 className="text-slate-500 uppercase tracking-widest text-[10px] mb-6 text-center font-black">Tipologia de Itens</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={80} axisLine={false} tickLine={false} />
              <Tooltip 
                 cursor={{ fill: 'rgba(34, 211, 238, 0.05)' }}
                 contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800">
        <h4 className="text-slate-500 uppercase tracking-widest text-[10px] mb-6 text-center font-black">Estado de Conservação</h4>
        <div className="grid grid-cols-2 gap-4">
           {conditionData.map((c, i) => (
             <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase">{c.name}</span>
                <span className="text-2xl font-black text-cyan-400">{c.value}</span>
             </div>
           ))}
           {conditionData.length === 0 && <p className="col-span-2 text-center text-slate-700 text-xs py-8">Nenhum dado disponível.</p>}
        </div>
      </div>
    </>
  );
};

export default CollectionStats;
