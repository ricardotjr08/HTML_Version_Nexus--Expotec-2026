/* Página de Suporte: busca, filtro por categoria e feedback das respostas */
(function () {
    var categoria = 'todas';
    var termo = '';

    var itens = Array.prototype.slice.call(document.querySelectorAll('#lista .sup-item'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('#chips .sup-chip'));
    var atalhos = Array.prototype.slice.call(document.querySelectorAll('.sup-atalho'));
    var busca = document.getElementById('busca');
    var contagem = document.getElementById('contagem');
    var vazio = document.getElementById('vazio');

    /* Ignora maiúsculas e acentos ("senha" acha "Senha", "usuario" acha "usuário") */
    function normalizar(texto) {
        return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function aplicar() {
        var total = 0;

        itens.forEach(function (item) {
            var passaCategoria = categoria === 'todas' || item.dataset.cat === categoria;
            var passaBusca = termo === '' || normalizar(item.textContent).indexOf(termo) > -1;
            var mostrar = passaCategoria && passaBusca;
            item.hidden = !mostrar;
            if (mostrar) total++;
        });

        contagem.textContent = total + (total === 1 ? ' pergunta' : ' perguntas');
        vazio.classList.toggle('d-none', total !== 0);

        chips.forEach(function (c) { c.classList.toggle('on', c.dataset.cat === categoria); });
        atalhos.forEach(function (a) { a.classList.toggle('on', a.dataset.cat === categoria); });
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            categoria = chip.dataset.cat;
            aplicar();
        });
    });

    atalhos.forEach(function (atalho) {
        atalho.addEventListener('click', function () {
            categoria = categoria === atalho.dataset.cat ? 'todas' : atalho.dataset.cat;
            aplicar();
            document.getElementById('faq').scrollIntoView({ behavior: 'smooth' });
        });
    });

    busca.addEventListener('input', function () {
        termo = normalizar(busca.value.trim());
        aplicar();
    });

    Array.prototype.forEach.call(document.querySelectorAll('.sup-sug'), function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            busca.value = link.dataset.q;
            termo = normalizar(link.dataset.q);
            categoria = 'todas';
            aplicar();
            document.getElementById('faq').scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* "Essa resposta ajudou?": por enquanto só agradece (não grava nada) */
    Array.prototype.forEach.call(document.querySelectorAll('.sup-fb'), function (bloco) {
        bloco.addEventListener('click', function (e) {
            if (e.target.tagName === 'BUTTON') {
                bloco.textContent = 'Obrigado pelo retorno.';
            }
        });
    });
})();
