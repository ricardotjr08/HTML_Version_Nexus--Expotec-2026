/* Carrossel: mouse nas laterais rola sozinho; clique pula um card; no celular é só deslizar */
(function () {
    var trilho = document.getElementById('feedback-trilho');
    if (!trilho) return;

    var setas = document.querySelectorAll('.feedback-seta');
    var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var direcao = 0, quadro = null;

    function rolar() {
        trilho.scrollLeft += direcao * 5;
        quadro = direcao ? requestAnimationFrame(rolar) : null;
    }

    function atualizarSetas() {
        var max = trilho.scrollWidth - trilho.clientWidth;
        document.querySelector('.feedback-seta-esq').classList.toggle('oculta', trilho.scrollLeft <= 2);
        document.querySelector('.feedback-seta-dir').classList.toggle('oculta', trilho.scrollLeft >= max - 2);
    }

    setas.forEach(function (seta) {
        var d = Number(seta.dataset.dir);
        seta.addEventListener('mouseenter', function () {
            if (semMovimento) return;
            direcao = d;
            if (!quadro) quadro = requestAnimationFrame(rolar);
        });
        seta.addEventListener('mouseleave', function () { direcao = 0; });
        seta.addEventListener('click', function () {
            trilho.scrollBy({ left: d * 360, behavior: semMovimento ? 'auto' : 'smooth' });
        });
    });

    trilho.addEventListener('scroll', atualizarSetas);
    window.addEventListener('resize', atualizarSetas);
    atualizarSetas();
})();
