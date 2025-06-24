import express from 'express';
import cors from 'cors';
import Database from '../database/Database.js';
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class Server {
    constructor(port = 3000) {
        this.app = express();
        this.port = port;
        this.db = Database.getInstance();
        this.middlewares();
        this.routes();
        this.app.use(express.static(path.join(__dirname, "../../public")));
    }
    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }
    routes() {
        this.app.get('/api/musica', async (req, res) => {
            console.log('GET /api/musica foi chamado');
            try {
                const { rows } = await this.db.query('SELECT * FROM musica');
                res.json(rows);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ error: 'Erro ao buscar músicas' });
            }
        });
        this.app.post('/api/musica', async (req, res) => {
            const { cd_musica, nome_musica, cd_album, cd_artista } = req.body;
            try {
                await this.db.query('INSERT INTO musica (cd_musica, nome_musica, cd_album, cd_artista) VALUES ($1, $2, $3, $4)', [cd_musica, nome_musica, cd_album, cd_artista]);
                res.sendStatus(201);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ err: 'erro ao adicionar musica' });
            }
        });
        this.app.get('/api/album', async (req, res) => {
            console.log('GET /api/album foi chamado');
            try {
                const { rows } = await this.db.query('SELECT * FROM album');
                res.json(rows);
            }
            catch (err) {
                res.status(500).json({ err: 'Erro ao adicionar album' });
            }
        });
        this.app.get('/api/usuario', async (req, res) => {
            console.log('GET /api/usuario foi chamado');
            try {
                const { rows } = await this.db.query('SELECT * from usuario');
                res.json(rows);
            }
            catch (err) {
                res.status(500).json({ err: 'Erro ao adicionar usuario' });
            }
        });
        this.app.post('/api/query', async (req, res) => {
            console.log('POST /api/query foi chamado');
            const { sql } = req.body;
            if (!sql || typeof sql !== "string") {
                return res.status(400).json({ error: "Comando SQL invalido." });
            }
            try {
                const result = await this.db.query(sql);
                res.json({
                    success: true,
                    rows: result.rows,
                    rowCount: result.rowCount,
                    command: result.command,
                });
            }
            catch (err) {
                console.error("Erro ao executar SQL:", err);
                res.status(400).json({
                    success: false,
                    error: err.message,
                });
            }
        });
        this.app.post('/api/execute-sql', async (req, res) => {
            const { query } = req.body;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({ error: 'Comando SQL inválido.' });
            }
            try {
                const result = await this.db.query(query);
                res.json(result.rows);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`Servidor rodando na porta ${this.port}`);
        });
    }
}
