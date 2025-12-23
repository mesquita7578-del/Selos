
import React, { useState, useRef, useEffect } from 'react';
import { Continent, ItemCondition, ItemType, PhilatelyItem } from '../types';
import { CONTINENTS, THEMES } from '../constants';
import { getSmartDescription } from '../services/geminiService';

interface ItemFormProps {
  onSave: (item: PhilatelyItem) => void;
  onCancel: () => void;
  initialData?: PhilatelyItem | null;
}

const ItemForm: React.FC<ItemFormProps> = ({ onSave, onCancel, initialData }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const fileInputFront = useRef<HTMLInputElement>(null);
  const fileInputBack = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<PhilatelyItem>>({
    type: ItemType.STAMP,
    country: '',
    continent: Continent.EUROPE,
    date: '',
    value: '',
    theme: THEMES[0],
    condition: ItemCondition.MINT,
    notes: '',
    imageFront: '',
    imageBack: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleAIHelp = async () => {
    if (!formData.country || !formData.date) {
      alert("Por favor, preencha o país e a data primeiro!");
      return;
    }
    setLoadingAI(true);
    const desc = await getSmartDescription(formData);
    setFormData(prev => ({ ...prev, notes: desc }));
    setLoadingAI(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          [side === 'front' ? 'imageFront' : 'imageBack']: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFront) {
      alert("Por favor, adicione pelo menos a imagem da frente.");
      return;
    }
    const newItem: PhilatelyItem = {
      ...formData as PhilatelyItem,
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || Date.now(),
      imageBack: formData.imageBack || formData.imageFront
    };
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-cyan-900/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold neon-text">{initialData ? 'Editar Item' : 'Registrar Novo Item'}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as ItemType})}
              >
                {Object.values(ItemType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Continente</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                value={formData.continent}
                onChange={e => setFormData({...formData, continent: e.target.value as Continent})}
              >
                {Object.values(Continent).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">País</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                placeholder="Ex: Portugal"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data (Ano)</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                placeholder="Ex: 1974"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                placeholder="Ex: 5.00 Escudos"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tema</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
              >
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estado</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 focus:border-cyan-500 outline-none text-sm"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value as ItemCondition})}
              >
                {Object.values(ItemCondition).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Bloco para Notas</label>
              <button 
                type="button"
                onClick={handleAIHelp}
                disabled={loadingAI}
                className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-cyan-900/50 transition-colors"
              >
                {loadingAI ? 'A pensar...' : '✨ Sugestão IA'}
              </button>
            </div>
            <textarea 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 h-24 focus:border-cyan-500 outline-none resize-none text-sm"
              placeholder="Notas sobre a raridade, proveniência ou conservação..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => fileInputFront.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all min-h-[140px] ${
                formData.imageFront ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-800 hover:border-slate-600 bg-slate-950/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputFront} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'front')} 
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-3">Imagem Frente</span>
              {formData.imageFront ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-cyan-500/30">
                  <img src={formData.imageFront} alt="Preview Front" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white">Alterar</span>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-600 border border-slate-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
              )}
            </div>

            <div 
              onClick={() => fileInputBack.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all min-h-[140px] ${
                formData.imageBack ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-800 hover:border-slate-600 bg-slate-950/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputBack} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'back')} 
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase mb-3">Imagem Verso</span>
              {formData.imageBack ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-cyan-500/30">
                  <img src={formData.imageBack} alt="Preview Back" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white">Alterar</span>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-600 border border-slate-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 transition-all neon-glow"
          >
            {initialData ? 'Atualizar' : 'Guardar Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
