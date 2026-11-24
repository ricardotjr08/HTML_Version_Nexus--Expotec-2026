/* Banco fictício baseado no esquema expotec.sql. Persistência em localStorage. */
(function (global) {
    'use strict';

    const DB_KEY = 'nexus_expotec_db_v1';
    const SESSION_KEY = 'nexus_session_v1';

    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    function padrao() {
        return {
            usuarios: [{ id: 1, nome: 'Admin Teste', email: 'admin@teste.com', senha: 'fortec1234', telefone: '40028922', bio: 'Usuário de teste', created_at: new Date().toISOString() }],
            empresas: [{ id: 1, nome: 'Nexus Comércio', descricao: 'Empresa demonstração', plano: 'profissional', owner_id: 1, created_at: new Date().toISOString() }],
            cargos: [{ id: 1, empresa_id: 1, nome: 'Patrão', nivel_acesso: 100 }],
            empresa_usuarios: [{ id: 1, empresa_id: 1, usuario_id: 1, cargo_id: 1, status: 'aceito', data_entrada: new Date().toISOString() }],
            secoes: [{ id: 1, empresa_id: 1, nome: 'Eletrônicos' }, { id: 2, empresa_id: 1, nome: 'Informática' }],
            produtos: [
                { id: 1, secao_id: 1, empresa_id: 1, nome: 'Notebook', descricao: 'Notebook corporativo', preco: 3500, custo: 2800, quantidade: 8, fornecedor: 'Tech Distribuidora' },
                { id: 2, secao_id: 2, empresa_id: 1, nome: 'Mouse USB', descricao: 'Mouse óptico', preco: 79.9, custo: 42, quantidade: 35, fornecedor: 'Periféricos Brasil' }
            ],
            movimentacoes: [],
            ocorrencias: [],
            logs: [{ id: 1, empresa_id: 1, usuario_id: 1, acao: 'sistema_iniciado', tabela_afetada: 'usuarios', detalhes: 'Dados fictícios inicializados', ip: '127.0.0.1', created_at: new Date().toISOString() }]
        };
    }

    function carregar() {
        try {
            const existente = localStorage.getItem(DB_KEY);
            if (existente) return JSON.parse(existente);
        } catch (e) {}
        const novo = padrao();
        salvar(novo);
        return novo;
    }

    function salvar(db) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }

    function session() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
    }

    function setSession(sessao) {
        if (sessao) sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
        else sessionStorage.removeItem(SESSION_KEY);
    }

    function nextId(lista) {
        return lista.reduce((maior, item) => Math.max(maior, Number(item.id) || 0), 0) + 1;
    }

    const NexusDB = {
        uid,
        get db() { return carregar(); },
        reset() { const db = padrao(); salvar(db); setSession(null); return db; },
        persist(db) { salvar(db); },
        session,

        login(email, senha) {
            const db = carregar();
            const usuario = db.usuarios.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.senha === senha);
            if (!usuario) return null;
            const vinculo = db.empresa_usuarios.find(v => v.usuario_id === usuario.id && v.status === 'aceito');
            const sessao = { usuario_id: usuario.id, usuario_nome: usuario.nome, empresa_id: vinculo ? vinculo.empresa_id : null, cargo_id: vinculo ? vinculo.cargo_id : null };
            setSession(sessao);
            return sessao;
        },

        registrar(nome, email, senha) {
            const db = carregar();
            email = String(email).trim().toLowerCase();
            if (db.usuarios.some(u => u.email.toLowerCase() === email)) return { ok: false, codigo: 'existe' };
            const usuario = { id: nextId(db.usuarios), nome: String(nome).trim(), email, senha, telefone: '', bio: '', created_at: new Date().toISOString() };
            db.usuarios.push(usuario); salvar(db);
            return { ok: true, usuario };
        },

        logout() { setSession(null); },

        getUsuario(id) { return carregar().usuarios.find(u => u.id === Number(id)) || null; },

        atualizarUsuario(id, dados) {
            const db = carregar();
            const u = db.usuarios.find(x => x.id === Number(id));
            if (!u) return false;
            Object.assign(u, dados); salvar(db); const s = session(); if (s) s.usuario_nome = u.nome; setSession(s); return true;
        },

        listarEmpresas(usuarioId) {
            const db = carregar();
            return db.empresa_usuarios.filter(v => v.usuario_id === Number(usuarioId) && v.status === 'aceito')
                .map(v => ({ vinculo: v, empresa: db.empresas.find(e => e.id === v.empresa_id) })).filter(x => x.empresa);
        },

        criarEmpresa(ownerId, dados) {
            const db = carregar();
            const empresa = { id: nextId(db.empresas), nome: dados.nome, descricao: dados.descricao || '', plano: dados.plano || 'profissional', owner_id: Number(ownerId), created_at: new Date().toISOString() };
            db.empresas.push(empresa);
            const cargo = { id: nextId(db.cargos), empresa_id: empresa.id, nome: 'Patrão', nivel_acesso: 100 };
            db.cargos.push(cargo);
            db.empresa_usuarios.push({ id: nextId(db.empresa_usuarios), empresa_id: empresa.id, usuario_id: Number(ownerId), cargo_id: cargo.id, status: 'aceito', data_entrada: new Date().toISOString() });
            db.secoes.push({ id: nextId(db.secoes), empresa_id: empresa.id, nome: 'Geral' });
            salvar(db);
            const s = session(); if (s) { s.empresa_id = empresa.id; s.cargo_id = cargo.id; setSession(s); }
            return empresa;
        },

        listarSecoes(empresaId) {
            const db = carregar();
            return db.secoes.filter(s => s.empresa_id === Number(empresaId)).map(s => ({ ...s, produtos: db.produtos.filter(p => p.secao_id === s.id && p.empresa_id === Number(empresaId)) }));
        },

        salvarSecao(empresaId, secao) {
            const db = carregar();
            if (secao.id) { const atual = db.secoes.find(s => s.id === Number(secao.id) && s.empresa_id === Number(empresaId)); if (atual) atual.nome = secao.nome; }
            else db.secoes.push({ id: nextId(db.secoes), empresa_id: Number(empresaId), nome: secao.nome });
            salvar(db); return true;
        },

        excluirSecao(empresaId, secaoId) {
            const db = carregar(); db.produtos = db.produtos.filter(p => !(p.secao_id === Number(secaoId) && p.empresa_id === Number(empresaId))); db.secoes = db.secoes.filter(s => !(s.id === Number(secaoId) && s.empresa_id === Number(empresaId))); salvar(db);
        },

        salvarProduto(empresaId, dados) {
            const db = carregar();
            let produto;
            if (dados.id) {
                produto = db.produtos.find(p => p.id === Number(dados.id) && p.empresa_id === Number(empresaId));
                if (!produto) return null; Object.assign(produto, dados); produto.id = Number(dados.id);
                this.log(empresaId, session()?.usuario_id || null, 'produto_editado', 'produtos', 'Produto atualizado');
            } else {
                produto = { id: nextId(db.produtos), secao_id: Number(dados.secao_id), empresa_id: Number(empresaId), nome: dados.nome, descricao: dados.descricao || '', preco: Number(dados.preco), custo: Number(dados.custo), quantidade: Number(dados.quantidade), fornecedor: dados.fornecedor || '' }; db.produtos.push(produto);
                this.log(empresaId, session()?.usuario_id || null, 'produto_adicionado', 'produtos', 'Produto criado');
            }
            salvar(db); return produto;
        },

        excluirProduto(empresaId, produtoId) {
            const db = carregar(); db.produtos = db.produtos.filter(p => !(p.id === Number(produtoId) && p.empresa_id === Number(empresaId))); salvar(db); this.log(empresaId, session()?.usuario_id || null, 'produto_removido', 'produtos', 'Produto removido');
        },

        listarCargos(empresaId) { return carregar().cargos.filter(c => c.empresa_id === Number(empresaId)); },

        criarCargo(empresaId, nome) {
            const db = carregar(); const cargo = { id: nextId(db.cargos), empresa_id: Number(empresaId), nome: nome.trim(), nivel_acesso: 1 }; db.cargos.push(cargo); salvar(db); return cargo;
        },

        excluirCargo(empresaId, cargoId) {
            const db = carregar(); db.cargos = db.cargos.filter(c => !(c.id === Number(cargoId) && c.empresa_id === Number(empresaId))); db.empresa_usuarios.forEach(v => { if (v.empresa_id === Number(empresaId) && v.cargo_id === Number(cargoId)) v.cargo_id = null; }); salvar(db);
        },

        log(empresaId, usuarioId, acao, tabela, detalhes) {
            const db = carregar(); db.logs.unshift({ id: nextId(db.logs), empresa_id: Number(empresaId), usuario_id: usuarioId ? Number(usuarioId) : null, acao, tabela_afetada: tabela, detalhes: typeof detalhes === 'string' ? detalhes : JSON.stringify(detalhes), ip: '127.0.0.1', created_at: new Date().toISOString() }); salvar(db);
        },

        listarLogs(empresaId) { return carregar().logs.filter(l => l.empresa_id === Number(empresaId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); },

        registrarMovimentacao(empresaId, dados) {
            const db = carregar(); const produto = db.produtos.find(p => p.id === Number(dados.produto_id) && p.empresa_id === Number(empresaId)); if (!produto) return 'Produto inválido.';
            const qtd = Number(dados.quantidade); if (dados.tipo === 'saida' && qtd > produto.quantidade) return 'Quantidade maior que o estoque atual.';
            produto.quantidade += dados.tipo === 'entrada' ? qtd : -qtd;
            db.movimentacoes.push({ id: nextId(db.movimentacoes), empresa_id: Number(empresaId), produto_id: produto.id, usuario_id: session()?.usuario_id || null, tipo: dados.tipo, quantidade: qtd, valor_unitario: Number(dados.valor_unitario), motivo: dados.motivo || 'Registrado no módulo de logs', created_at: dados.created_at || new Date().toISOString() });
            salvar(db); this.log(empresaId, session()?.usuario_id || null, dados.tipo, 'movimentacoes_estoque', `${dados.tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${qtd} unidade(s) de ${produto.nome}`); return null;
        }
    };

    global.NexusDB = NexusDB;
    carregar();
})(window);
