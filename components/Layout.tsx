
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNewClick?: () => void;
  onScanClick?: () => void;
  onExportJson?: () => void;
  onImportJson?: () => void;
  onInstallApp?: () => void;
  onStatsClick?: () => void;
  showInstallBtn?: boolean;
  continentsData?: Record<string, number>;
  selectedContinent?: string | null;
  onContinentSelect?: (continent: string | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onNewClick, 
  onScanClick, 
  onExportJson, 
  onImportJson,
  onInstallApp,
  onStatsClick,
  showInstallBtn = false,
  continentsData = {},
  selectedContinent = null,
  onContinentSelect
}) => {
  const continentLabels: Record<string, string> = {
    'Africa': 'África',
    'Americas': 'Américas',
    'Asia': 'Ásia',
    'Europe': 'Europa',
    'Oceania': 'Oceania'
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Header Principal */}
      <header className="sticky top-0 z-[110] bg-slate-950/90 backdrop-blur-lg border-b border-cyan-500/20 px-4 py-3 md:px-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-10 h-10 bg-cyan-500 rounded-xl neon-glow flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform group-hover:scale-105">
            <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight neon-text leading-none">PhilaArchive <span className="text-slate-400 font-light">Neon</span></h1>
            <span className="text-[8px] text-cyan-500/50 uppercase tracking-[0.4em] font-black">Curadoria Digital</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botões de Comando Superiores */}
          <div className="hidden lg:flex items-center bg-slate-900/80 border border-slate-800 rounded-full p-1 shadow-inner">
            <button 
              onClick={onStatsClick}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              ESTATÍSTICAS
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1"></div>
            <button 
              onClick={onExportJson}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400 hover:text-white transition-colors"
            >
              EXP JSON
            </button>
            <button 
              onClick={onImportJson}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400 hover:text-white transition-colors"
            >
              IMP JSON
            </button>
          </div>

          <button 
            onClick={onScanClick}
            className="flex items-center gap-2 bg-slate-900 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-black transition-all uppercase tracking-widest hover:bg-cyan-950/40 hover:border-cyan-400 group"
          >
            <svg className="w-4 h-4 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0111 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Scanner IA
          </button>

          <button 
            onClick={onNewClick}
            className="flex items-center gap-2 bg-cyan-500 text-slate-950 px-4 py-2 rounded-full text-[10px] font-black transition-all uppercase tracking-widest neon-glow hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Novo
          </button>
        </div>
      </header>

      {/* Barra Continental Fixa Full-Width */}
      <nav className="sticky top-[65px] z-[100] w-full bg-slate-950/60 backdrop-blur-md border-b border-slate-800/50 py-3 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between gap-8 min-w-max">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onContinentSelect && onContinentSelect(null)}
              className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${selectedContinent === null ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'}`}
            >
              Globo Completo
            </button>
            <div className="w-px h-5 bg-slate-800 mx-2"></div>
            {Object.keys(continentLabels).map((key) => (
              <button 
                key={key}
                onClick={() => onContinentSelect && onContinentSelect(key)}
                className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${selectedContinent === key ? 'bg-slate-900 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-200'}`}
              >
                {continentLabels[key]}
                <span className={`px-2 py-0.5 rounded-lg text-[9px] ${selectedContinent === key ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-600'}`}>
                  {continentsData[key] || 0}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden xl:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                SISTEMA ONLINE
             </div>
             <div className="w-px h-4 bg-slate-800"></div>
             <div className="flex items-center gap-2">
                <span>V.3.1 LIVE</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="border-t border-slate-900 py-10 bg-slate-950">
        <div className="max-w-[1600px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <div className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">PhilaArchive Neon</div>
            <div className="text-slate-600 text-[9px] font-medium uppercase tracking-widest">Sistema de Gestão e Análise de Filatelia Digital</div>
          </div>
          <div className="flex gap-10">
            {['Termos', 'Privacidade', 'API', 'Suporte'].map(link => (
              <a key={link} href="#" className="text-slate-600 hover:text-cyan-500 text-[10px] font-black uppercase tracking-widest transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
