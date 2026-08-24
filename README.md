# 🤖 BotsitoWa - Sticker.ly a WhatsApp Bot

Un bot de WhatsApp construido en Node.js que extrae paquetes de stickers completos (estáticos y animados) directamente desde la API privada de Sticker.ly y los inyecta en tu chat de WhatsApp. 

Despídete de la publicidad, de las aplicaciones de terceros y de los recortes de calidad.

## ✨ Características
- **By-pass de la App:** Ataca directamente la API nativa de Sticker.ly simulando ser un dispositivo Android, obteniendo los archivos originales sin pasar por el frontend web.
- **Soporte Animado:** Convierte y procesa stickers animados al vuelo manteniendo el framerate usando `sharp`.
- **Formato Perfecto:** Redimensiona automáticamente los archivos a 512x512 y fuerza las cabeceras a `image/webp` para que WhatsApp los acepte de forma nativa sin errores de "sticker transparente".
- **Anti-Ban:** Incluye pausas estratégicas de inyección para simular tráfico humano y evitar bloqueos de cuenta.

## 🛠️ Requisitos Previos
Antes de clonar el repositorio, asegúrate de tener instalado en tu sistema:
1. [Node.js](https://nodejs.org/) (Versión 18 o superior).
2. **Git** (Para clonar el repositorio).

## 🚀 Instalación y Uso

**1. Clonar el repositorio:**
```bash
git clone https://github.com/diegoparra-git/BotsitoWa.git
cd BotsitoWa
```
**2. Instalar las dependencias:**
```bash
npm install
```
**3. Iniciar el bot:**
```bash
node index.js
```
**4. Vincular tu cuenta:**
- Al ejecutar el comando anterior, aparecerá un Código QR en tu terminal.
- Abre WhatsApp en tu celular > Dispositivos vinculados > Vincular un dispositivo.
- Escanea el QR. ¡La sesión se guardará localmente de forma segura!

## 🎮 ¿Cómo se usa?
Una vez que la terminal diga **🤖 ¡Bot conectado al servidor!:**
1. Ve a tu aplicación de WhatsApp.
2. Abre el chat de "Mensajes contigo mismo" (o cualquier chat privado).
3. Pega el enlace de un paquete de Sticker.ly (ejemplo: https://sticker.ly/s/XXXXXX).
4. El bot detectará el enlace, descargará los recursos y te los enviará uno por uno listos para añadir a favoritos.

## ⚠️ Advertencia / Descargo de responsabilidad
Este proyecto tiene fines estrictamente educativos. El uso excesivo o el envío masivo de stickers sin respetar los tiempos de espera del código (1.5s - 2s) podría activar los filtros de SPAM de WhatsApp y resultar en el bloqueo de tu cuenta. Úsalo con moderación y preferiblemente en tu chat personal.
