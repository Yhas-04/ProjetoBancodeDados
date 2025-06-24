let cdUsuario: number | null = null;

function obterCdUsuarioDaURL(): number | null {
    const params = new URLSearchParams(window.location.search);
    const cdStr = params.get("usuario") ?? '';
    const cd = parseInt(cdStr, 10);
    if (isNaN(cd)) {
        console.error("Parâmetro 'usuario' inválido na URL.");
        return null;
    }
    console.log("Funcionandooooooooo");
    return cd;
}

async function carregarDados(): Promise<void> {
    const ulFaixas = document.querySelector('.recFaixas') as HTMLUListElement | null;
    if (!ulFaixas) {
        console.error('Elemento .recFaixas não encontrado');
        return;
    }
    try {
        const resFaixas = await fetch('/api/musica');
        const dataFaixas = await resFaixas.json();
        if (!resFaixas.ok) {
            const erroMensagem = (dataFaixas && typeof dataFaixas === 'object' && 'error' in dataFaixas)
                ? dataFaixas.error
                : 'Erro desconhecido';
            throw new Error(erroMensagem);
        }
        const faixas = dataFaixas as any[];
        ulFaixas.innerHTML = '';
        if (faixas.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma música encontrada';
            ulFaixas.appendChild(li);
        }
        else {
            faixas.forEach(musica => {
                const li = document.createElement('li');
                li.textContent = musica.nome_musica + ' ';
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = 'Selecionar';
                button.addEventListener('click', async () => {
                    if (cdUsuario === null) {
                        alert('Usuário não identificado.');
                        return;
                    }
                    const sucesso = await adicionarMusicaPlaylist(cdUsuario, musica.cd_musica);
                    if (sucesso) {
                        alert('Música adicionada à playlist com sucesso!');
                        await carregarPlaylist(cdUsuario);
                    }
                    else {
                        alert('Falha ao adicionar música.');
                    }
                });
                li.appendChild(button);
                ulFaixas.appendChild(li);
            });
        }
    }
    catch (error) {
        console.error('Erro ao buscar músicas:', error);
    }
    const ulAlbuns = document.querySelector('.recAlbuns') as HTMLUListElement | null;
    if (!ulAlbuns) {
        console.error('Elemento .recAlbuns não encontrado');
        return;
    }
    try {
        const resAlbuns = await fetch('/api/album');
        const dataAlbuns = await resAlbuns.json();
        if (!resAlbuns.ok) {
            const erroMensagem = (dataAlbuns && typeof dataAlbuns === 'object' && 'error' in dataAlbuns)
                ? dataAlbuns.error
                : 'Erro desconhecido';
            throw new Error(erroMensagem);
        }
        const albuns = dataAlbuns as any[];
        ulAlbuns.innerHTML = '';
        if (albuns.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhum álbum encontrado';
            ulAlbuns.appendChild(li);
        }
        else {
            albuns.forEach(album => {
                const li = document.createElement('li');
                li.textContent = album.nm_album;
                ulAlbuns.appendChild(li);
            });
        }
    }
    catch (error) {
        console.error('Erro ao buscar álbuns:', error);
    }
    const ulPerfis = document.querySelector('.recPerfis') as HTMLUListElement | null;
    if (!ulPerfis) {
        console.error('Elemento .recPerfis não encontrado');
        return;
    }
    try {
        const resPerfis = await fetch('/api/usuario');
        const dataPerfis = await resPerfis.json();
        if (!resPerfis.ok) {
            const erroMensagem = (dataPerfis && typeof dataPerfis === 'object' && 'error' in dataPerfis)
                ? dataPerfis.error
                : 'Erro desconhecido';
            throw new Error(erroMensagem);
        }
        const perfis = dataPerfis as any[];
        ulPerfis.innerHTML = '';
        if (perfis.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhum perfil encontrado';
            ulPerfis.appendChild(li);
        }
        else {
            perfis.forEach(usuario => {
                const li = document.createElement('li');
                li.textContent = usuario.nome_usuario;
                ulPerfis.appendChild(li);
            });
        }
    }
    catch (error) {
        console.error('Erro ao buscar perfis:', error);
    }
}

let musicasPlaylist: any[] = [];
let indiceAtual = 0;
async function carregarPlaylist(cd_usuario: number): Promise<void> {
    const ulPlaylist = document.querySelector('.playlist') as HTMLUListElement | null;
    const player = document.getElementById('audioPlayer') as HTMLAudioElement | null;
    const titulo = document.getElementById('tituloMusica') as HTMLElement | null;
    if (!ulPlaylist || !player || !titulo)
        return;
    try {
        const response = await fetch(`/api/playlist/${cd_usuario}`);
        const dados = await response.json();
        if (!response.ok) {
            const erroMensagem = (dados && typeof dados === 'object' && 'error' in dados)
                ? dados.error
                : 'Erro desconhecido';
            throw new Error(erroMensagem);
        }
        const musicas = dados as any[];
        musicasPlaylist = musicas;
        indiceAtual = 0;
        ulPlaylist.innerHTML = '';
        if (musicas.length === 0) {
            ulPlaylist.textContent = 'Playlist vazia';
            return;
        }
        musicas.forEach((musica, index) => {
            const li = document.createElement('li');
            li.textContent = musica.nome_musica;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => tocarMusica(index));
            ulPlaylist.appendChild(li);
        });
    }
    catch (error) {
        console.error('Erro ao carregar playlist:', error);
    }
}

async function adicionarMusicaPlaylist(cd_usuario: number, cd_musica: number): Promise<boolean> {
    try {
        const response = await fetch('/api/playlist-musica', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cd_usuario, cd_musica }),
        });
        const dados = await response.json();
        if (!response.ok) {
            const erroMensagem = (dados && typeof dados === 'object' && 'error' in dados)
                ? dados.error
                : 'Erro desconhecido';
            throw new Error(erroMensagem);
        }
        await carregarDados();
        return true;
    }
    catch (error) {
        console.error('Erro ao adicionar música:', error instanceof Error ? error.message : error);
        return false;
    }
}

const botaoLimpar = document.getElementById('btnLimparPlaylist') as HTMLButtonElement | null;
botaoLimpar?.addEventListener('click', () => {
    setTimeout(async () => {
        if (!botaoLimpar)
            return;
        botaoLimpar.disabled = true;
        try {
            const res = await fetch(`/api/playlist/${cdUsuario}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Erro desconhecido');
            alert('Playlist limpa com sucesso.');
            if (cdUsuario !== null)
                await carregarPlaylist(cdUsuario);
        }
        catch (error) {
            alert('Erro: ' + (error instanceof Error ? error.message : 'Desconhecido'));
        }
        finally {
            botaoLimpar.disabled = false;
        }
    }, 0);
});

function tocarMusica(index: number): void {
    if (!musicasPlaylist || index >= musicasPlaylist.length) return;
    const musica = musicasPlaylist[index];
    if (!musica.arquivo) {
        console.warn('Arquivo de música inválido:', musica);
        return;
    }
    const player = document.getElementById('audioPlayer') as HTMLAudioElement | null;
    const titulo = document.getElementById('tituloMusica') as HTMLElement | null;
    const albumCover = document.getElementById('albumCover') as HTMLImageElement | null;
    if (!player || !titulo || !albumCover) return;

    player.pause();
    player.src = musica.arquivo;
    player.load();
    titulo.textContent = musica.nome_musica;

    if (musica.foto_album) {
        // Se for URL:
        albumCover.src = musica.foto_album;
        // Se for base64, descomente a linha abaixo:
        // albumCover.src = 'data:image/jpeg;base64,' + musica.foto_album;
    } else {
        console.warn('foto_album não está definida para esta música');
        albumCover.src = 'caminho/para/imagem_padrao.jpg'; // opcional
    }
    player.onloadedmetadata = () => {
        player.play().catch(err => console.error('Erro ao reproduzir música:', err));
    };
}

document.getElementById('audioPlayer')?.addEventListener('ended', () => {
    if (indiceAtual + 1 < musicasPlaylist.length) {
        tocarMusica(++indiceAtual);
    }
});

async function carregarPerfilUsuario(): Promise<void> {
    try {
        if (cdUsuario === null)
            throw new Error('Usuário não identificado');
        const response = await fetch(`/api/usuario/${cdUsuario}`);
        const usuario = await response.json();
        if (!response.ok) {
            const erroMensagem = (usuario && typeof usuario === 'object' && 'error' in usuario)
                ? usuario.error
                : 'Erro desconhecido';
            throw new Error(erroMensagem);
        }
        const ulPerfilUsuario = document.querySelector('.usuarioAtual') as HTMLUListElement | null;
        const divImgUsuario = document.querySelector('.usuarioImg') as HTMLDivElement | null;
        if (!ulPerfilUsuario || !divImgUsuario)
            return;
        ulPerfilUsuario.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = usuario.nome_usuario;
        ulPerfilUsuario.appendChild(li);
        if (usuario.foto_usuario) {
            divImgUsuario.innerHTML = '';
            const img = document.createElement('img');
            img.src = usuario.foto_usuario;
            img.alt = 'Foto do usuário';
            divImgUsuario.appendChild(img);
        }
    }
    catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error instanceof Error ? error.message : error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    cdUsuario = obterCdUsuarioDaURL();
    if (!cdUsuario) {
        alert('Usuário não identificado. Adicione http://localhost:3000/index.html?usuario=1 à URL.');
        return;
    }
    await carregarDados();
    await carregarPlaylist(cdUsuario);
    await carregarPerfilUsuario();
});

const formSQL = document.getElementById('formSQL') as HTMLFormElement | null;
formSQL?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.getElementById('sqlInput') as HTMLInputElement | null;
    const resultadoDiv = document.querySelector('.resultBusca') as HTMLDivElement | null;

    if (!input || !resultadoDiv) return;

    const comandoSQL = input.value.trim();

    if (!comandoSQL) {
        resultadoDiv.textContent = 'Digite um comando SQL.';
        return;
    }

    // Limpa conteúdo anterior e cria a <ul> para resultados
    resultadoDiv.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'resultado-lista';
    resultadoDiv.appendChild(ul);

    const viewsPermitidas = new Set([
        'vw_musicas_completo',
        'vw_musicas_mais_adicionadas',
        'vw_musicas_sem_album',
        'vw_top5_artistas',
    ]);

    const matchView = comandoSQL.match(/^SELECT\s+\*\s+FROM\s+(vw_\w+);?$/i);
    const nomeView = matchView?.[1];

    try {
        let data;
        if (nomeView && viewsPermitidas.has(nomeView)) {
            const res = await fetch(`/api/view/${nomeView}`);
            data = await res.json();

            if (!res.ok) {
                resultadoDiv.textContent = `Erro: ${data?.error ?? 'Erro desconhecido.'}`;
                return;
            }
        } else {
            const res = await fetch('/api/execute-sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: comandoSQL }),
            });
            data = await res.json();

            if (!res.ok) {
                resultadoDiv.textContent = `Erro: ${data?.error ?? 'Erro desconhecido.'}`;
                return;
            }
        }

        if (Array.isArray(data)) {
            if (data.length > 0) {
                data.forEach((item) => {
                    const li = document.createElement('li');
                    li.className = 'resultado-item';

                    const seenKeys = new Set();
                    li.innerHTML = Object.entries(item)
                        .filter(([key]) => {
                            if (seenKeys.has(key)) return false;
                            seenKeys.add(key);
                            return true;
                        })
                        .map(([key, value]) => `<strong>${key}:</strong> ${value ?? ''}`)
                        .join('<br>');

                    ul.appendChild(li);
                });

                if (typeof carregarDados === 'function') {
                    carregarDados();
                }
            } else {
                resultadoDiv.textContent = 'Nenhum resultado encontrado.';
            }
        } else {
            resultadoDiv.textContent = 'Comando executado com sucesso.';
        }
    } catch (error: any) {
        resultadoDiv.textContent = `Erro ao executar comando: ${error.message}`;
    }
});

export {};