import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const envPath = path.resolve(currentDirectory, '../../.env');

dotenv.config({ path: envPath });

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('El puerto debe ser un número entre 1 y 65535.');
}

export const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: port,
    API_PREFIX: process.env.API_PREFIX ?? '/api/v1'
});