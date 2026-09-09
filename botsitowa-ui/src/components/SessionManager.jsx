import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getSessionStatus, postLogout } from '../lib/api';

export default function SessionManager() {
  const [status, setStatus] = useState({ connected: false, qr: null });
  const [backendReachable, setBackendReachable] = useState(true);

  const checkStatus = async () => {
    try {
      const data = await getSessionStatus();
      setStatus(data);
      setBackendReachable(true);
    } catch (error) {
      setBackendReachable(false);
    }
  };

  // Pregunta al backend cada 3 segundos
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que quieres desvincular el dispositivo?')) {
      try {
        await postLogout();
      } catch (error) {
        // Aunque falle, refrescamos el estado igual
      }
      checkStatus();
    }
  };

  return (
    <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm flex flex-col items-center">
      <h2 className="text-xl font-bold text-slate-700 mb-4">📱 Estado de WhatsApp</h2>

      {!backendReachable ? (
        <p className="text-red-500 font-medium text-center">
          🔌 No se pudo conectar con el servidor.
          <br />
          <span className="text-sm text-slate-500 font-normal">¿Está corriendo "node index.js"?</span>
        </p>
      ) : status.connected ? (
        <div className="text-center">
          <div className="inline-block p-3 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            ✅ Conectado y Listo
          </div>
          <button 
            onClick={handleLogout}
            className="block w-full py-2 px-4 bg-red-400 hover:bg-red-500 text-white rounded-xl shadow-md transition-all"
          >
            Cerrar Sesión (Logout)
          </button>
        </div>
      ) : status.qr ? (
        <div className="text-center flex flex-col items-center">
          <p className="text-sm text-slate-600 mb-4">Escanea el QR con tu WhatsApp</p>
          <div className="p-4 bg-white rounded-xl shadow-inner">
            <QRCodeSVG value={status.qr} size={200} />
          </div>
        </div>
      ) : (
        <p className="text-slate-500 animate-pulse">⏳ Iniciando motor de WhatsApp...</p>
      )}
    </div>
  );
}