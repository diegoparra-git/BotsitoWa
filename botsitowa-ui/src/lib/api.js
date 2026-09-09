const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 30000;

async function request(path, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            signal: controller.signal
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || `Error ${res.status}`);
        }
        return data;

    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('El servidor tardó demasiado en responder (¿el bot sigue conectado?)');
        }
        if (err.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar con el servidor. ¿Está corriendo "node index.js"?');
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

export function postStickerUrl(url) {
    return request('/api/sticker-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });
}

export function postStickerFile(file) {
    const formData = new FormData();
    formData.append('imagen', file);
    // Procesar GIFs grandes con sharp puede tardar más que una llamada normal
    return request('/api/sticker-file', { method: 'POST', body: formData }, 60000);
}

export function getSessionStatus() {
    return request('/api/session/status', {}, 5000);
}

export function postLogout() {
    return request('/api/session/logout', { method: 'POST' });
}