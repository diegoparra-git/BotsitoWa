import React from 'react';
import UrlInput from './components/UrlInput';
import FileInput from './components/FileInput';
import SessionManager from './components/SessionManager';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] relative overflow-hidden">

        {/* Fondo decorativo interno */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-500 mb-3 drop-shadow-sm tracking-tight">
            BotsitoWa Studio
          </h1>
          <p className="text-slate-600 font-medium text-lg mb-6">Inyector de Stickers Dinámico</p>
          <SessionManager />
        </div>

        <div className="grid gap-6 relative z-10">
          <UrlInput />
          <FileInput />
        </div>

      </div>
    </div>
  );
}

export default App;