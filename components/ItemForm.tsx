
import React, { useState, useRef, useEffect } from 'react';
import { Continent, ItemCondition, ItemType, PhilatelyItem } from '../types';
import { CONTINENTS, THEMES } from '../constants';
import { analyzeDualImages, getSmartDescription } from '../services/geminiService';

interface ItemFormProps {
  onSave: (item: PhilatelyItem) => void;
  onCancel: () => void;
  initialData?: PhilatelyItem | null;
}

const ItemForm: React.FC<ItemFormProps> = ({ onSave, onCancel, initialData }) => {
  const [analyzingImage, setAnalyzingImage] = useState(false);
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

  useEffect(() => { if (initialData) setFormData(initialData); }, [initialData]);

  const handleAIHelp = async () => {
    setLoadingAI(true);
    const desc = await getSmartDescription(formData);
    setFormData(prev => ({ ...prev, notes: desc }));
    setLoadingAI(false);
  };

  const runDualExtraction = async () => {
    if (!formData.imageFront) return alert("Adicione pelo menos a imagem da frente.");
    setAnalyzingImage(true);
    const metadata = await analyzeDualImages(formData.imageFront!, formData.imageBack || formData.imageFront!);
    if (metadata) {
      setFormData(prev => ({
        ...prev,
        ...metadata,
        notes: metadata.notes ? (prev.notes ? prev.notes + "\n" + metadata.notes : metadata.notes) : prev.notes
      }));
    }
    setAnalyzingImage(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [side === 'front' ? 'imageFront' : 'imageBack']: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageFront) return alert("Frente obrigatória.");
    onSave({
      ...formData as PhilatelyItem,
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || Date.now(),
      imageBack: formData.imageBack || formData.imageFront || ''
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-cyan-900/40 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black neon-text uppercase tracking-widest">{initialData ? 'Editar Registro' : 'Novo Arquivo'}</h2>
          <button onClick={onCancel} className="text-2xl text-slate-500 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div onClick={() => fileInputFront.current?.click()} className={`relative aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${formData.imageFront ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'}`}>
                <input type="file" ref={fileInputFront} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'front')} />
                {formData.imageFront ? <img src={formData.imageFront} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-[10px] font-black text-slate-500 uppercase">FRENTE</span>}
                {analyzingImage && <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl animate-pulse"></div>}
             </div>
             <div onClick={() => fileInputBack.current?.click()} className={`relative aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${formData.imageBack ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'}`}>
                <input type="file" ref={fileInputBack} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'back')} />
                {formData.imageBack ? <img src={formData.imageBack} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-[10px] font-black text-slate-500 uppercase">VERSO</span>}
                {analyzingImage && <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl animate-pulse"></div>}
             </div>
          </div>

          <button type="button" onClick={runDualExtraction} disabled={analyzingImage || !formData.imageFront} className="w-full py-4 bg-cyan-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] neon-glow disabled:opacity-50">
            {analyzingImage ? 'IA Escaneando Frente + Verso...' : 'Extrair Dados com Fluxo Duplo IA'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">País</label><input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" required /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Ano</label><input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" /></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Continente</label><select value={formData.continent} onChange={e => setFormData({...formData, continent: e.target.value as Continent})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none">{Object.values(Continent).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tema</label><select value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none">{THEMES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Valor</label><input type="text" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" /></div>
          </div>

          <div>
             <div className="flex justify-between mb-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Notas</label><button type="button" onClick={handleAIHelp} className="text-[9px] text-cyan-500 font-black uppercase">✨ Gerar Descrição</button></div>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none h-24 resize-none" />
          </div>
        </form>
        <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 border border-slate-800 text-slate-500 rounded-xl font-black text-[10px] uppercase">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-black text-[10px] uppercase neon-glow">{initialData ? 'Atualizar' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
