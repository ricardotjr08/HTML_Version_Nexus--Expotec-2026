(function () {
    'use strict';

    const sessao = window.NexusDB ? NexusDB.session() : null;

    window.nexusAuth = {
        requerLogin() {
            if (!sessao) {
                const caminho = this.loginUrl();
                window.location.replace(caminho);
                return false;
            }
            return true;
        },
        loginUrl() {
            const pagina = window.location.pathname.replace(/\\/g, '/');
            return pagina.includes('/servicos/') || pagina.includes('/paginas/') ? '../login/login.html' : 'login/login.html';
        },
        logoutUrl() {
            const pagina = window.location.pathname.replace(/\\/g, '/');
            return pagina.includes('/servicos/') || pagina.includes('/paginas/') ? '../index.html' : 'index.html';
        }
    };

    function montarCabecalho() {
        const mount = document.querySelector('[data-nexus-header]');
        if (!mount) return;
        const interno = mount.dataset.internal === 'true';
        const base = mount.dataset.base || '';
        const atual = mount.dataset.page || '';
        const sessaoAtual = NexusDB.session();

        const links = interno
            ? '<a href="' + base + 'servicos/dashboard.html" class="nav-btn" data-page="dashboard">Dashboard</a><a href="' + base + 'servicos/produtos.html" class="nav-btn" data-page="produtos">Produtos</a><a href="' + base + 'servicos/logs.html" class="nav-btn" data-page="logs">Logs</a>'
            : '<a href="' + base + 'index.html" class="nav-btn" data-page="inicio">Início</a><a href="' + base + 'paginas/termos.html" class="nav-btn" data-page="termos">Termos de Uso</a><a href="' + base + 'paginas/privacidade.html" class="nav-btn" data-page="privacidade">Privacidade</a><a href="' + base + 'paginas/suporte.html" class="nav-btn" data-page="suporte">Suporte</a>';

        mount.innerHTML = '<header class="sticky-top"><div class="container-xl d-flex align-items-center justify-content-between py-3"><a href="' + base + (interno ? 'servicos/workspace.html' : 'index.html') + '" class="d-flex align-items-center text-decoration-none" style="color:inherit"><div class="logo-icon me-2"><i class="fa-solid fa-boxes-stacked"></i></div><span class="fw-semibold fs-5">Nexus</span></a><nav class="nav-menu d-flex gap-1">' + links + '</nav><div class="d-flex gap-2 align-items-center">' + (sessaoAtual ? '<span class="small me-1" style="color:var(--cor-texto-secundario)">Olá, ' + (sessaoAtual.usuario_nome || 'Usuário') + '</span><button type="button" class="btn btn-sm login-btn" id="nexus-sair">Sair</button>' : '<a href="' + base + 'login/login.html" class="btn btn-sm login-btn">Login</a><a href="' + base + 'login/cadastro.html" class="btn btn-sm btn-primary">Criar Conta</a>') + '</div></div></header>';

        mount.querySelectorAll('[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === atual));
        const sair = document.getElementById('nexus-sair');
        if (sair) sair.addEventListener('click', function () { NexusDB.logout(); window.location.href = base + 'index.html'; });
    }

    function montarRodape() {
        const mount = document.querySelector('[data-nexus-footer]');
        if (!mount) return;
        const base = mount.dataset.base || '';
        mount.innerHTML = '<footer class="mt-auto py-4"><div class="container-xl"><div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"><div><strong>Nexus</strong><span class="footer-text"> &copy; 2026. Todos os direitos reservados.</span></div><div class="d-flex gap-4"><a href="' + base + 'paginas/termos.html">Termos</a><a href="' + base + 'paginas/privacidade.html">Privacidade</a><a href="' + base + 'paginas/suporte.html">Suporte</a></div></div></div></footer>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        montarCabecalho(); montarRodape();
    });
})();
