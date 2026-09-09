import React, { useState, useRef } from 'react';
import { postStickerFile } from '../lib/api';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4'];

export default function FileInput() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const acceptFile = (candidate) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setStatus('error');
      setMessage('❌ Formato no soportado. Usa imagen, GIF o MP4.');
      return;
    }
    setFile(candidate);
    setMessage('');
    setStatus('idle');
  };

  const handleFileChange = (e) => {
    acceptFile(e.target.files && e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('loading');
    setMessage('');

    try {
      await postStickerFile(file);
      setStatus('success');
      setMessage('✨ ¡Sticker inyectado en tu chat personal!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setStatus('error');
      setMessage('❌ ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.05)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
      
      <h2 className="text-xl font-bold text-slate-700 mb-5 relative z-10 flex items-center gap-2 drop-shadow-sm">
        <span className="text-2xl">📁</span> Subir Archivo Local
      </h2>
      
      <div className="flex flex-col gap-4 relative z-10">
        
        {/* Zona de Drop / Selección */}
        <div 
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
            isDragging ? 'border-emerald-400 bg-white/80 scale-[1.02]' : 'border-cyan-400/60 bg-white/50 hover:bg-white/70'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/mp4,image/gif" 
            className="hidden" 
          />
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
            {file ? '📄' : isDragging ? '📥' : '☁️'}
          </span>
          <p className="text-slate-600 font-medium text-center px-4">
            {file ? file.name : isDragging ? 'Suéltalo aquí' : 'Arrastra un archivo o haz clic para seleccionarlo'}
          </p>
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading' || !file}
          className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(52,211,153,0.3)] transition-all active:scale-95 disabled:opacity-50 border border-white/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl"></div>
          {status === 'loading' ? '⏳ Subiendo...' : '🚀 Enviar a mi WhatsApp'}
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