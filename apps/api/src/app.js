import express from 'express';
import { env } from './config/env.js';
import router from './routes/index.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.use(env.API_PREFIX, router);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: 'Ruta no encontrada.'
    });
});