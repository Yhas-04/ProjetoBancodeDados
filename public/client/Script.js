let cdUsuario = null;
function obterCdUsuarioDaURL() {
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
async function carregarDados() {
    const ulFaixas = document.querySelector('.recFaixas');
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
        const faixas = dataFaixas;
        ulFaixas.innerHTML = '';
        if (faixas.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma música encontrada';
            ulFaixas.appendChild(li);
        }
        else {
            faixas.forEach((musica) => {
                const li = document.createElement('li');
                li.textContent = musica.nome_musica + ' ';
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = 'add playlist';
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
    const ulAlbuns = document.querySelector('.recAlbuns');
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
        const albuns = dataAlbuns;
        ulAlbuns.innerHTML = '';
        if (albuns.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhum álbum encontrado';
            ulAlbuns.appendChild(li);
        }
        else {
            albuns.forEach((album) => {
                const li = document.createElement('li');
                li.textContent = album.nm_album;
                ulAlbuns.appendChild(li);
            });
        }
    }
    catch (error) {
        console.error('Erro ao buscar álbuns:', error);
    }
    const ulPerfis = document.querySelector('.recPerfis');
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
        const perfis = dataPerfis;
        ulPerfis.innerHTML = '';
        if (perfis.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhum perfil encontrado';
            ulPerfis.appendChild(li);
        }
        else {
            perfis.forEach((usuario) => {
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
let musicasPlaylist = [];
let indiceAtual = 0;
async function carregarPlaylist(cd_usuario) {
    const ulPlaylist = document.querySelector('.playlist');
    const player = document.getElementById('audioPlayer');
    const titulo = document.getElementById('tituloMusica');
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
        const musicas = dados;
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
async function adicionarMusicaPlaylist(cd_usuario, cd_musica) {
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
const botaoLimpar = document.getElementById('btnLimparPlaylist');
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
function tocarMusica(index) {
    if (!musicasPlaylist || index >= musicasPlaylist.length)
        return;
    const musica = musicasPlaylist[index];
    if (!musica.arquivo) {
        console.warn('Arquivo de música inválido:', musica);
        return;
    }
    const player = document.getElementById('audioPlayer');
    const titulo = document.getElementById('tituloMusica');
    const albumCover = document.getElementById('albumCover');
    if (!player || !titulo || !albumCover)
        return;
    player.pause();
    player.src = musica.arquivo;
    player.load();
    titulo.textContent = musica.nome_musica;
    albumCover.src = musica.foto_album || 'caminho/para/imagem_padrao.jpg';
    player.onloadedmetadata = () => {
        player.play().catch(err => console.error('Erro ao reproduzir música:', err));
    };
}
document.getElementById('audioPlayer')?.addEventListener('ended', () => {
    if (indiceAtual + 1 < musicasPlaylist.length) {
        tocarMusica(++indiceAtual);
    }
});
async function carregarPerfilUsuario() {
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
        const ulPerfilUsuario = document.querySelector('.usuarioAtual');
        const divImgUsuario = document.querySelector('.usuarioImg');
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
const formSQL = document.getElementById('formSQL');
formSQL?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('sqlInput');
    const resultadoDiv = document.querySelector('.resultBusca');
    if (!input || !resultadoDiv)
        return;
    const comandoSQL = input.value.trim();
    if (!comandoSQL) {
        resultadoDiv.textContent = 'Digite um comando SQL.';
        return;
    }
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
        }
        else {
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
                        if (seenKeys.has(key))
                            return false;
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
            }
            else {
                resultadoDiv.textContent = 'Nenhum resultado encontrado.';
            }
        }
        else {
            resultadoDiv.textContent = 'Comando executado com sucesso.';
        }
    }
    catch (error) {
        resultadoDiv.textContent = `Erro ao executar comando: ${error.message}`;
    }
});
export {};
