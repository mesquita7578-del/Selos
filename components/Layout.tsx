
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/30 px-4 py-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl neon-glow flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight neon-text leading-none">PhilaArchive <span className="text-slate-400 font-light">Neon</span></h1>
            <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.3em] font-black">Digital Philately</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-slate-900/50 border border-slate-800 rounded-full px-6 py-1.5 space-x-8">
          <button 
            onClick={() => scrollTo('dashboard')} 
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all flex items-center gap-2 group"
          >
            <div className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            Dashboard
          </button>
          <button 
            onClick={() => scrollTo('stats')} 
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all flex items-center gap-2 group"
          >
            <div className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            Estatísticas
          </button>
          <button 
            onClick={() => scrollTo('collection')} 
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all flex items-center gap-2 group"
          >
            <div className="w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            Acervo
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 px-4 py-2 rounded-full text-xs font-bold transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Exportar
          </button>
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-full font-bold transition-all neon-glow flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <svg className="w-4 h-4 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span className="hidden sm:inline">Sincronizar Nuvem</span>
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
      <footer className="border-t border-slate-900/50 py-8 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-xs font-medium">
            &copy; 2024 PhilaArchive Neon - Gestão de Alta Performance para Colecionadores
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-600 hover:text-cyan-500 text-xs transition-colors">Termos</a>
            <a href="#" className="text-slate-600 hover:text-cyan-500 text-xs transition-colors">Privacidade</a>
            <a href="#" className="text-slate-600 hover:text-cyan-500 text-xs transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Layout;
