const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const sharp = require('sharp');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('🤖 ¡Bot conectado al servidor!'));

client.on('message_create', async (msg) => {
    const text = msg.body;

    if (text.includes('sticker.ly/s/')) {
        // 1. Extraemos solo el código del paquete (ej: WZZU8J)
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
            
            // Validamos que el paquete realmente exista y tenga stickers
            if (!packInfo || !packInfo.stickers) {
                return msg.reply('❌ La API no devolvió datos válidos para este paquete.');
            }

            const prefix = packInfo.resourceUrlPrefix;
            const stickers = packInfo.stickers;
            
            await msg.reply(`✅ ¡Bingo! El pack "${packInfo.name}" tiene ${stickers.length} stickers. Descargando y procesando...`);

            let successCount = 0;
            
            
            // Recorremos el array de stickers de la base de datos
            for (const sticker of stickers) {
                try {
                    const url = prefix + sticker.fileName;
                    
                    // 1. Descargamos el archivo original
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    
                    // 2. DETECCIÓN del JSON para saber si este sticker específico tiene movimiento
                    const isAnim = sticker.isAnimated || sticker.animated || false;

                    // 3. CONVERSIÓN flag 'animated' a Sharp
                    const webpBuffer = await sharp(response.data, { animated: isAnim })
                        .resize({ 
                            width: 512, 
                            height: 512, 
                            fit: 'contain', 
                            background: { r: 0, g: 0, b: 0, alpha: 0 } 
                        })
                        .webp({ 
                            quality: 80, 
                            force: true // reescritura de las cabeceras WebP
                        })
                        .toBuffer();
                    
                    // 4. Inyección
                    const base64 = webpBuffer.toString('base64');
                    const media = new MessageMedia('image/webp', base64, 'sticker.webp');
                    
                    await client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
                    successCount++;
                    
                    // Pausa de seguridad
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

client.initialize();