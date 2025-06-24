document.addEventListener('DOMContentLoaded', () => {
    const ul = document.querySelector('.recFaixas'); // ou '#recFaixas' se for id
    if (!ul) {
        console.error('Elemento .recFaixas não encontrado');
        return;
    }
    fetch('/api/musica')
        .then(res => res.json())
        .then((data) => {
        console.log(data);
        ul.innerHTML = ''; // Limpa a lista antes de inserir os itens
        if (data.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma música encontrada';
            ul.appendChild(li);
            return;
        }
        data.forEach(musica => {
            const li = document.createElement('li');
            li.textContent = musica.nome_musica; // confirme o nome do campo no objeto
            ul.appendChild(li);
        });
    })
        .catch(error => {
        console.error('Erro ao buscar músicas:', error);
    });
});
document.getElementById('formSQL')?.addEventListener('submit', (e) => {
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
    fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: comandoSQL })
    })
        .then(res => res.json())
        .then(data => {
        if (data.error) {
            resultadoDiv.textContent = `Erro: ${data.error}`;
        }
        else {
            resultadoDiv.textContent = JSON.stringify(data, null, 2);
        }
    })
        .catch(err => {
        resultadoDiv.textContent = `Erro na requisição: ${err.message}`;
    });
});
export {};
