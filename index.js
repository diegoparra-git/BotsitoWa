const fs = require('fs');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const sharp = require('sharp');

// Importamos el motor de nuestra API REST
const startAPI = require('./api');

// 🧹 Limpieza de locks huérfanos de Chromium
// Si el proceso se cerró de forma abrupta (crash, cierre de terminal, kill -9),
// Puppeteer puede dejar un archivo SingletonLock dentro de .wwebjs_auth que
// bloquea el siguiente arranque y hace que el cliente se quede "pensando"
// para siempre sin lanzar 'ready' ni ningún error.
function limpiarLocksHuerfanos() {
    const authDir = path.join(__dirname, '.wwebjs_auth');
    if (!fs.existsSync(authDir)) return;

    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.name === 'SingletonLock' || entry.name === 'SingletonCookie' || entry.name === 'SingletonSocket') {
                try {
                    fs.unlinkSync(full);
                    console.log(`🧹 Lock huérfano eliminado: ${full}`);
                } catch (e) {
                    // Si no se puede borrar, seguimos igual: no es fatal
                }
            }
        }
    };

    try {
        walk(authDir);
    } catch (e) {
        console.warn('No se pudo limpiar locks huérfanos:', e.message);
    }
}
limpiarLocksHuerfanos();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',   
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ],
        timeout: 60000
    }
    // 💡 Si los cuelgues persisten, prueba fijar webVersionCache a una versión
    // remota estable (busca "whatsapp-web.js webVersionCache" en su wiki de
    // GitHub para la URL vigente). WhatsApp Web actualiza su versión seguido
    // y a veces la librería queda desincronizada, causando cuelgues silenciosos
    // en vez de errores.
});

// ⏱️ Watchdog: si el bot lleva demasiado tiempo sin conectar, avisa en consola
// en vez de quedarse "pensando" sin ninguna pista de qué está pasando.
let readyTimeout = setTimeout(() => {
    console.warn('⚠️ Llevan +60s sin conectar. Revisa si quedó un proceso de Chrome huérfano (Administrador de tareas / `pkill chrome`), o borra la carpeta .wwebjs_auth/session si el problema persiste tras varios reinicios.');
}, 60000);

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    client.currentQR = qr;
    client.isConnected = false;
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando WhatsApp Web... ${percent}% - ${message}`);
});

client.on('change_state', (state) => {
    console.log(`🔄 Estado de conexión: ${state}`);
});

client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa (Sesión restaurada)');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Fallo fatal en la autenticación:', msg);
});

client.on('ready', () => {
    clearTimeout(readyTimeout);
    console.log('🤖 ¡Bot conectado al servidor!');
    client.currentQR = null;
    client.isConnected = true;
});

client.on('disconnected', (reason) => {
    console.log('🔴 Cliente desconectado:', reason);
    client.isConnected = false;
});

client.on('message_create', async (msg) => {
    const text = msg.body || '';

    // FUNCIÓN: Descargar de Sticker.ly
    if (text.includes('sticker.ly/s/')) {
        const packId = text.split('sticker.ly/s/')[1].split('/')[0].trim();
        await msg.reply(`Atacando la API de Sticker.ly buscando el ID: ${packId}...⏳`);

        try {
            const config = {
                headers: {
                    'User-Agent': 'androidapp.stickerly/1.13.3 (G011A; U; Android 22; pt-BR; br;)',
                    'Host': 'api.sticker.ly'
                }
            };

            const apiUrl = `http://api.sticker.ly/v3.1/stickerPack/${packId.toUpperCase()}`;
            const { data } = await axios.get(apiUrl, config);
            const packInfo = data.result;

            if (!packInfo || !packInfo.stickers) {
                return msg.reply('❌ La API no devolvió datos válidos para este paquete.');
            }

            const prefix = packInfo.resourceUrlPrefix;
            const stickers = packInfo.stickers;

            await msg.reply(`✅ ¡Bingo! El pack "${packInfo.name}" tiene ${stickers.length} stickers. Descargando y procesando...`);

            let successCount = 0;

            for (const sticker of stickers) {
                try {
                    const url = prefix + sticker.fileName;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });

                    const isAnim = sticker.isAnimated || sticker.animated || false;

                    const webpBuffer = await sharp(response.data, { animated: isAnim })
                        .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .webp({ quality: 80, force: true })
                        .toBuffer();

                    const base64 = webpBuffer.toString('base64');
                    const media = new MessageMedia('image/webp', base64, 'sticker.webp');

                    await client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
                    successCount++;

                    await new Promise(resolve => setTimeout(resolve, 1500));
                } catch (err) {
                    console.log(`Error aislando/convirtiendo: ${sticker.fileName} - ${err.message}`);
                }
            }

            await msg.reply(`¡Completado! Se inyectaron ${successCount} stickers perfectos directamente desde la base de datos.🎉`);

        } catch (error) {
            console.error('Error del servidor:', error.message);
            await msg.reply('❌ Error al conectar con la API.');
        }
    }
});

startAPI(client);

client.initialize();

// --- SISTEMA DE APAGADO SEGURO ---
process.on('SIGINT', async () => {
    console.log('\n⚠️ Apagando el bot de forma segura...');
    try {
        await client.destroy();
    } catch (error) {
        // Si ya estaba caído, no es fatal
    }
    console.log('✅ Proceso finalizado.');
    process.exit(0);
});