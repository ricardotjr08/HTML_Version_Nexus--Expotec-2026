/* Termos de Uso: destaca no índice a seção que está na tela e mostra o botão "voltar ao topo" */
(function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.termos-indice a'));
    var secoes = Array.prototype.slice.call(document.querySelectorAll('.termos-secao'));
    var topo = document.getElementById('voltar-topo');

    function marcar(id) {
        links.forEach(function (a) { a.classList.toggle('ativo', a.dataset.alvo === id); });
    }

    function atualizar() {
        var atual = secoes.length ? secoes[0].id : '';
        secoes.forEach(function (s) {
            if (s.getBoundingClientRect().top <= 140) atual = s.id;
        });
        marcar(atual);
        topo.classList.toggle('visivel', window.scrollY > 400);
    }

    window.addEventListener('scroll', atualizar, { passive: true });
    atualizar();

    topo.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
