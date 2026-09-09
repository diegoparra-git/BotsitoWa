const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const sharp = require('sharp');

const upload = multer({ storage: multer.memoryStorage() });

// Resuelve el chatId destino y valida que el bot esté listo antes de usar whatsappClient.info
function resolveChatId(whatsappClient, numero) {
    if (numero && numero.trim() !== '') {
        return numero.includes('@c.us') ? numero : `${numero}@c.us`;
    }
    if (!whatsappClient.isConnected || !whatsappClient.info) {
        throw new Error('El bot aún no está conectado a WhatsApp, espera a que termine de cargar');
    }
    return whatsappClient.info.wid._serialized;
}

function startAPI(whatsappClient) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // 🌐 ENDPOINT 1: Inyección por URL directa
    app.post('/api/sticker-url', async (req, res) => {
        const { url, numero } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Faltan datos: se requiere url' });
        }

        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                }
            });

            const webpBuffer = await sharp(response.data, { animated: true })
                .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 40, effort: 6, smartSubsample: true, force: true })
                .toBuffer();

            const base64 = webpBuffer.toString('base64');
            const media = new MessageMedia('image/webp', base64, 'sticker.webp');

            const chatId = resolveChatId(whatsappClient, numero);
            await whatsappClient.sendMessage(chatId, media, { sendMediaAsSticker: true });
            res.json({ success: true, message: '✅ Sticker inyectado en tu chat' });

        } catch (error) {
            console.error('Error en /api/sticker-url:', error.message);
            res.status(500).json({ error: error.message || 'Fallo al procesar la URL' });
        }
    });

    // 📁 ENDPOINT 2: Inyección por archivo local
    app.post('/api/sticker-file', upload.single('imagen'), async (req, res) => {
        const { numero } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Faltan datos: se requiere una imagen' });
        }

        try {
            const webpBuffer = await sharp(req.file.buffer, { animated: true })
                .resize({ width: 256, height: 256, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 10, effort: 6, smartSubsample: true, force: true })
                .toBuffer();

            const pesoKB = webpBuffer.length / 1024;
            console.log(`📏 Peso del archivo procesado: ${pesoKB.toFixed(2)} KB`);

            if (pesoKB > 500) {
                return res.status(400).json({ error: `El GIF es muy largo. Pesa ${pesoKB.toFixed(2)} KB (Límite: 500 KB)` });
            }

            const base64 = webpBuffer.toString('base64');
            const media = new MessageMedia('image/webp', base64, 'sticker.webp');

            const chatId = resolveChatId(whatsappClient, numero);
            await whatsappClient.sendMessage(chatId, media, { sendMediaAsSticker: true });
            res.json({ success: true, message: '✅ Archivo inyectado en tu chat' });

        } catch (error) {
            console.error('Error en /api/sticker-file:', error.message);
            res.status(500).json({ error: error.message || 'Fallo al procesar el archivo' });
        }
    });

    // 📡 ENDPOINT 3: Estado de la sesión
    app.get('/api/session/status', (req, res) => {
        res.json({
            connected: !!whatsappClient.isConnected,
            qr: whatsappClient.currentQR || null
        });
    });

    // 🚪 ENDPOINT 4: Cerrar sesión (Logout)
    app.post('/api/session/logout', async (req, res) => {
        try {
            await whatsappClient.logout();
            whatsappClient.isConnected = false;
            res.json({ success: true, message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Fallo al cerrar la sesión' });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 API REST encendida y escuchando en http://localhost:${PORT}`);
    });
}

module.exports = startAPI;