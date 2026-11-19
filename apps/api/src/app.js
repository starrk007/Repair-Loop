import express from 'express';
import { env } from './config/env.js';
import router from './routes/index.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (origin && env.CORS_ORIGINS.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Vary', 'Origin');
    }
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use(env.API_PREFIX, router);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: 'Ruta no encontrada.'
    });
});