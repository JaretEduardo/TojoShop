// adafruit-websocket-client.js
const mqtt = require('mqtt');

// Configuración centralizada desde env.json
const path = require('path');
const fs = require('fs');
const configPath = path.join(__dirname, 'env.json');
let cfg = {};
try {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
    console.log(JSON.stringify({ type: 'config_error', message: 'No se pudo leer env.json', error: e.message }));
}
const ADAFRUIT_IO_URL = 'wss://io.adafruit.com/mqtt';
const AIO_USERNAME = cfg.AIO_USERNAME || process.env.AIO_USERNAME || 'MISSING_USERNAME';
const AIO_KEY = cfg.AIO_KEY || process.env.AIO_KEY || 'MISSING_AIO_KEY';
const FEED_NAME = (cfg.AIO_FEEDS && cfg.AIO_FEEDS.gas) ? cfg.AIO_FEEDS.gas : 'sensor-gas';

// Crear conexión MQTT sobre WebSocket
const client = mqtt.connect(ADAFRUIT_IO_URL, {
    username: AIO_USERNAME,
    password: AIO_KEY,
    clientId: 'nodejs_client_' + Math.random().toString(16).substr(2, 8),
    keepalive: 30,
    reconnectPeriod: 1000,
    protocolVersion: 4,
    clean: true,
});

// Eventos de conexión
client.on('connect', () => {
    const topic = `${AIO_USERNAME}/feeds/${FEED_NAME}`;
    console.log(JSON.stringify({ type: 'connect', feed_name: FEED_NAME, client_id: client.options.clientId, timestamp: new Date().toISOString() }));
    client.subscribe(topic, (err) => {
        console.log(JSON.stringify({ type: err ? 'subscribe_error' : 'subscribed', feed_name: FEED_NAME, topic, error: err ? err.message : null, timestamp: new Date().toISOString() }));
    });
});

// Recibir mensajes en tiempo real
const { enqueueIngest } = require('./ingestClient');
client.on('message', (topic, message, packet) => {
    const payload = { type: 'data', feed_name: FEED_NAME, topic, value: message.toString(), qos: packet.qos, retain: packet.retain, timestamp: new Date().toISOString(), client_id: client.options.clientId };
    console.log(JSON.stringify(payload));
    // Enviar sólo lo necesario al backend Laravel
    enqueueIngest({ feed_name: FEED_NAME, value: payload.value, timestamp: payload.timestamp, aio_key: AIO_KEY });
});

// Manejo de errores
client.on('error', (error) => {
    console.log(JSON.stringify({ type: 'error', feed_name: FEED_NAME, message: error.message, timestamp: new Date().toISOString() }));
});

// Conexión cerrada
client.on('close', () => {
    console.log(JSON.stringify({ type: 'close', feed_name: FEED_NAME, timestamp: new Date().toISOString() }));
});

// Desconexión
client.on('disconnect', () => {
    console.log(JSON.stringify({ type: 'disconnect', feed_name: FEED_NAME, timestamp: new Date().toISOString() }));
});

// Reconexión
client.on('reconnect', () => {
    console.log(JSON.stringify({ type: 'reconnect', feed_name: FEED_NAME, timestamp: new Date().toISOString() }));
});

// Offline
client.on('offline', () => {
    console.log(JSON.stringify({ type: 'offline', feed_name: FEED_NAME, timestamp: new Date().toISOString() }));
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log(JSON.stringify({ type: 'shutdown', feed_name: FEED_NAME, timestamp: new Date().toISOString() }));
    client.end(() => process.exit(0));
});

console.log(JSON.stringify({ type: 'startup', feed_name: FEED_NAME, username: AIO_USERNAME, url: ADAFRUIT_IO_URL, has_key: AIO_KEY !== 'MISSING_AIO_KEY', timestamp: new Date().toISOString() }));