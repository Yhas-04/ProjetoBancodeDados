import express from 'express';
import cors from 'cors';
import Database from '../database/Database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Server {
    private app = express();
    private port: number;
    private db: Database;

    constructor(port: number = 3000) {
        this.port = port;
        this.db = Database.getInstance();

        this.middlewares();
        this.routes();
    }

    private middlewares() {
        this.app.use('/static/imagens', express.static('public/images/perfil'));
        this.app.use('/static/music', express.static('public/music'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, "../../public")));

    }

    private routes() {
        this.app.get('/api/musica', async (req, res) => {
            console.log('GET /api/musica foi chamado');
            try {
                const { rows } = await this.db.query('SELECT * FROM musica');
                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao buscar músicas' });
            }
        });

        this.app.post('/api/musica', async (req, res) => {
            const { cd_musica, nome_musica, cd_album, cd_artista } = req.body;
            try {
                await this.db.query(
                    'INSERT INTO musica (cd_musica, nome_musica, cd_album, cd_artista) VALUES ($1, $2, $3, $4)',
                    [cd_musica, nome_musica, cd_album, cd_artista]
                );
                res.sendStatus(201);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao adicionar música' });
            }
        });

        this.app.get('/api/album', async (req, res) => {
            console.log('GET /api/album foi chamado');
            try {
                const { rows } = await this.db.query('SELECT * FROM album');
                res.json(rows);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao buscar álbuns' });
            }
        });

        this.app.get('/api/usuario', async (req, res) => {
            console.log('GET /api/usuario foi chamado');
            try {
                const { rows } = await this.db.query('SELECT * FROM usuario');
                const usuariosFormatados = rows.map(user => ({
                    cd_usuario: user.cd_usuario,
                    nome_usuario: user.nome_usuario,
                    foto_usuario: user.foto_usuario || null,
                }));
                res.json(usuariosFormatados);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao buscar usuários' });
            }
        });

        this.app.get('/api/usuario/:id', async (req, res) => {
            const id = req.params.id;

            try {
                const { rows } = await this.db.query('SELECT * FROM usuario WHERE cd_usuario = $1', [id]);
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                const usuario = rows[0];
                res.json({
                    cd_usuario: usuario.cd_usuario,
                    nome_usuario: usuario.nome_usuario,
                    foto_usuario: usuario.foto_usuario || null,
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao buscar usuário' });
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
            } catch (err: any) {
                console.error(err);
                res.status(400).json({ error: err.message });
            }
        });
        this.app.post('/api/playlist-musica', async (req, res) => {
            const { cd_usuario, cd_musica } = req.body;

            if (!cd_usuario || !cd_musica) {
                return res.status(400).json({ error: 'Parâmetros cd_usuario e cd_musica são obrigatórios.' });
            }

            try {
                const playlistResult = await this.db.query(
                    'SELECT cd_playlist FROM playlist WHERE cd_usuario = $1',
                    [cd_usuario]
                );

                if (playlistResult.rows.length === 0) {
                    return res.status(404).json({ error: 'Playlist do usuário não encontrada.' });
                }

                const cd_playlist = playlistResult.rows[0].cd_playlist;

                const ordemResult = await this.db.query(
                    'SELECT COALESCE(MAX(ordem), -1) AS max_ordem FROM playlist_musica WHERE cd_playlist = $1',
                    [cd_playlist]
                );

                const maxOrdem = ordemResult.rows[0].max_ordem;
                const novaOrdem = maxOrdem + 1;


                await this.db.query(
                    'INSERT INTO playlist_musica (cd_playlist, cd_musica, ordem) VALUES ($1, $2, $3)',
                    [cd_playlist, cd_musica, novaOrdem]
                );

                return res.status(201).json({ message: 'Música adicionada à playlist com sucesso.' });

            } catch (error) {
                console.error('Erro ao adicionar música à playlist:', error);
                return res.status(500).json({ error: 'Erro interno do servidor.' });
            }
        });


        this.app.delete('/api/playlist/:cd_usuario', async (req, res) => {
            const cd_usuario = req.params.cd_usuario;

            try {
                const result = await this.db.query(
                    'SELECT cd_playlist FROM playlist WHERE cd_usuario = $1',
                    [cd_usuario]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Playlist não encontrada para este usuário.' });
                }

                const cd_playlist = result.rows[0].cd_playlist;

                await this.db.query(
                    'DELETE FROM playlist_musica WHERE cd_playlist = $1',
                    [cd_playlist]
                );

                return res.status(200).json({ message: 'Playlist limpa com sucesso.' });

            } catch (error) {
                console.error('Erro ao limpar playlist:', error);
                return res.status(500).json({ error: 'Erro interno ao limpar playlist.' });
            }
        });
        this.app.get('/api/playlist/:cd_usuario', async (req, res) => {
            const cd_usuario = req.params.cd_usuario;
            try {
                const query = `
                    SELECT
                        m.cd_musica,
                        m.nome_musica,
                        m.arquivo,
                        a.nm_album,
                        a.foto_album,
                        p.cd_playlist,
                        pm.ordem
                    FROM playlist p
                             JOIN playlist_musica pm ON p.cd_playlist = pm.cd_playlist
                             JOIN musica m ON pm.cd_musica = m.cd_musica
                             JOIN album a ON m.cd_album = a.cd_album
                    WHERE p.cd_usuario = $1
                    ORDER BY pm.ordem ASC
                `;
                const { rows } = await this.db.query(query, [cd_usuario]);
                console.log(rows);
                res.json(rows);
            } catch (error) {
                console.error(error);
                res.status(500).json({ erro: 'Erro ao carregar a playlist' });
            }
        });

        const VIEWS_PERMITIDAS = new Set([
            'vw_musicas_completo',
            'vw_musicas_mais_adicionadas',
            'vw_musicas_sem_album',
            'vw_top5_artistas',
        ]);

        this.app.get('/api/view/:nome', async (req, res) => {
            const nomeView = req.params.nome;

            if (!VIEWS_PERMITIDAS.has(nomeView)) {
                return res.status(400).json({ error: 'View não permitida.' });
            }

            try {
                const resultado = await this.db.query(`SELECT * FROM ${nomeView}`);
                res.json(resultado.rows);
            } catch (error) {
                console.error(`Erro ao consultar ${nomeView}:`, error);
                res.status(500).json({ error: 'Erro ao executar consulta.' });
            }
        });

    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`Servidor rodando na porta ${this.port}`);
        });
    }
}
