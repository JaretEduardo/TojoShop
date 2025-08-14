// Helper para enviar datos al backend Laravel /api/ingest
const https = require('https');
const http = require('http');

// Normalización de la URL de ingesta
let rawIngestUrl = process.env.INGEST_URL || 'http://localhost:8000/api/ingest';
rawIngestUrl = rawIngestUrl.trim();
// Remover comillas accidentales
rawIngestUrl = rawIngestUrl.replace(/^['"]|['"]$/g, '');
// Si no trae protocolo, asumir http
if (!/^https?:\/\//i.test(rawIngestUrl)) {
    rawIngestUrl = 'http://' + rawIngestUrl;
}
let VALID_INGEST_URL = 'http://localhost:8000/api/ingest';
try {
    // Validar construyendo objeto URL (si falla caeremos al catch)
    new URL(rawIngestUrl);
    VALID_INGEST_URL = rawIngestUrl;
} catch (e) {
    console.log(JSON.stringify({ type: 'ingest_config_warning', message: 'INGEST_URL invalida, usando default', provided: rawIngestUrl }));
}
const INGEST_URL = VALID_INGEST_URL;
const INGEST_TOKEN = process.env.INGEST_TOKEN || null; // Debe coincidir con env('INGEST_TOKEN') en Laravel si se usa
// Intentar cargar clave AIO desde env.json (si existe) sin depender de variables de otros módulos
let LOCAL_AIO_KEY = null;
try {
    const fs = require('fs');
    const path = require('path');
    const envCfgPath = path.join(__dirname, 'env.json');
    if (fs.existsSync(envCfgPath)) {
        const envCfg = JSON.parse(fs.readFileSync(envCfgPath, 'utf8'));
        if (envCfg && envCfg.AIO_KEY) LOCAL_AIO_KEY = envCfg.AIO_KEY;
    }
} catch (e) {
    // Silencioso: sólo log informativo
    console.log(JSON.stringify({ type: 'ingest_env_warning', message: 'No se pudo leer AIO_KEY de env.json', error: e.message }));
}
// Clave efectiva: variable de entorno tiene prioridad
const AIO_KEY = process.env.AIO_KEY || LOCAL_AIO_KEY || null;
console.log(JSON.stringify({ type: 'ingest_config', ingest_url: INGEST_URL, has_token: !!INGEST_TOKEN }));

function postIngest(payload) {
    return new Promise((resolve, reject) => {
        try {
            const urlObj = new URL(INGEST_URL);
            const dataStr = JSON.stringify(payload);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataStr),
                },
                timeout: 5000,
            };
            if (INGEST_TOKEN) {
                options.headers['X-INGEST-TOKEN'] = INGEST_TOKEN;
            }
            if (AIO_KEY) {
                options.headers['X-AIO-KEY'] = AIO_KEY;
            }
            const transport = urlObj.protocol === 'https:' ? https : http;
            const req = transport.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ statusCode: res.statusCode, body });
                    } else {
                        const err = new Error('Ingest response ' + res.statusCode + ': ' + body);
                        // Adjuntamos status para lógica de reintentos
                        err.statusCode = res.statusCode;
                        err.body = body;
                        reject(err);
                    }
                });
            });
            req.on('error', (err) => reject(err));
            req.on('timeout', () => {
                req.destroy(new Error('Ingest timeout'));
            });
            req.write(dataStr);
            req.end();
        } catch (e) {
            reject(e);
        }
    });
}

// Cola simple para limitar concurrencia y evitar flood al backend
const queue = [];
let active = 0;
const MAX_ACTIVE = 3;
const RETRY_DELAY_MS = 500; // backoff base

function processQueue() {
    if (active >= MAX_ACTIVE) return;
    const next = queue.shift();
    if (!next) return;
    active++;
    postIngest(next.payload)
        .then(() => {
            console.log(JSON.stringify({ type: 'ingest_success', feed_name: next.payload.feed_name, timestamp: new Date().toISOString() }));
        })
        .catch(err => {
            const status = err.statusCode || 0;
            console.log(JSON.stringify({ type: 'ingest_error', feed_name: next.payload.feed_name, error: err.message, status, retries: next.retries, timestamp: new Date().toISOString() }));
            // Política de reintentos:
            // 401 (clave inválida) o 500 por falta de clave -> no reintentar
            if (status === 401 || status === 500) {
                // no reintentos adicionales
            } else if (status === 429) {
                // Too Many Requests: reintentar menos veces pero con backoff más grande
                if (next.retries < 2) {
                    const delay = 2000 * (next.retries + 1);
                    setTimeout(() => {
                        queue.push({ payload: next.payload, retries: next.retries + 1 });
                        processQueue();
                    }, delay);
                }
            } else {
                // Otros errores: hasta 3 reintentos exponenciales
                if (next.retries < 3) {
                    const delay = RETRY_DELAY_MS * Math.pow(2, next.retries);
                    setTimeout(() => {
                        queue.push({ payload: next.payload, retries: next.retries + 1 });
                        processQueue();
                    }, delay);
                }
            }
        })
        .finally(() => {
            active--;
            if (active < MAX_ACTIVE) setImmediate(processQueue);
        });
}

function enqueueIngest(dataPayload) {
    queue.push({ payload: dataPayload, retries: 0 });
    processQueue();
}

module.exports = { enqueueIngest };
