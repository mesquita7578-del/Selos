
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/50 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg neon-glow flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM14.95 6.464a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM6.464 14.95l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414-1.414z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight neon-text">PhilaArchive <span className="text-slate-400 font-light">Neon</span></h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="hover:text-cyan-400 transition-colors">Dashboard</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Coleção</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Estatísticas</a>
        </nav>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold transition-all neon-glow flex items-center gap-2">
          <span>Sincronizar</span>
        </button>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
      <footer className="border-t border-slate-900 py-6 text-center text-slate-500 text-sm">
        &copy; 2024 PhilaArchive Neon - Coleção Digital Profissional
      </footer>
    </div>
  );
};

export default Layout;
