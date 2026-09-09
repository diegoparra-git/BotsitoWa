import React, { useState } from 'react';
import { postStickerUrl } from '../lib/api';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await postStickerUrl(url);
      setStatus('success');
      setMessage('✨ ¡Sticker inyectado en tu chat personal!');
      setUrl('');
    } catch (error) {
      setStatus('error');
      setMessage('❌ ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.05)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
      
      <h2 className="text-xl font-bold text-slate-700 mb-5 relative z-10 flex items-center gap-2 drop-shadow-sm">
        <span className="text-2xl">🌐</span> Inyectar por URL
      </h2>
      
      <div className="flex flex-col gap-4 relative z-10">
        <input 
          type="url" 
          placeholder="Pega el enlace de la imagen o GIF aquí..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner text-slate-700 placeholder-slate-400 transition-all"
        />
        
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(52,211,153,0.3)] transition-all active:scale-95 disabled:opacity-50 border border-white/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl"></div>
          {status === 'loading' ? '⏳ Procesando...' : '🚀 Enviar a mi WhatsApp'}
        </button>

        {message && (
          <div className={`p-3 rounded-xl text-sm font-semibold text-center border ${status === 'success' ? 'bg-emerald-100/80 border-emerald-200 text-emerald-700' : 'bg-red-100/80 border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </form>
  );
}