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
export {};
