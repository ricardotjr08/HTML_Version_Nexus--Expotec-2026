/* Constantes e elementos do DOM */
const CHAVE_CONVIDADOS = 'usuariosConvidados';
const CHAVE_CARGOS = 'cargosUsuarios';

const listaConvidados = document.getElementById('lista-convidados');
const listaCargos = document.getElementById('lista-cargos');

/* Modal de convite */
const modalConviteEl = document.getElementById('modal-convite');
const modalConvite = new bootstrap.Modal(modalConviteEl);
const formConvite = document.getElementById('form-convite');
const campos = {
    nome: document.getElementById('c-nome'),
    cargo: document.getElementById('c-cargo'),
    email: document.getElementById('c-email')
};
const avisoCargo = document.getElementById('aviso-cargo');
const tituloConvite = document.getElementById('convite-titulo');
const btnSalvarConvite = document.getElementById('btn-salvar-convite');
const btnExcluirConvidado = document.getElementById('btn-excluir-convidado');

/* Modal de cargos */
const modalCargos = new bootstrap.Modal(document.getElementById('modal-cargos'));
const modalCargosEl = document.getElementById('modal-cargos');
const formCargo = document.getElementById('form-cargo');
const inputCargo = document.getElementById('cargo-nome');
const erroCargo = document.getElementById('erro-cargo');

let alvoId = null;


/* Gerador de ID */
function novoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


/* Dados */
function ler(chave) {
    try { return JSON.parse(localStorage.getItem(chave) || '[]'); } catch (e) { return []; }
}

let cargos = ler(CHAVE_CARGOS);
let convidados = ler(CHAVE_CONVIDADOS);

function salvar() {
    try {
        localStorage.setItem(CHAVE_CARGOS, JSON.stringify(cargos));
        localStorage.setItem(CHAVE_CONVIDADOS, JSON.stringify(convidados));
    } catch (e) {}
}

function achaCargo(id) {
    return cargos.find(c => c.id === id);
}


/* Convidados */
function renderConvidados() {
    listaConvidados.innerHTML = '';

    if (convidados.length === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'text-secondary small mb-0';
        vazio.textContent = 'Nenhum convidado ainda.';
        listaConvidados.appendChild(vazio);
        return;
    }

    convidados.forEach(conv => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'convidado-item';

        const nome = document.createElement('span');
        nome.className = 'convidado-nome';
        nome.textContent = conv.nome;

        const email = document.createElement('span');
        email.className = 'convidado-email';
        email.textContent = conv.email;

        const cargo = achaCargo(conv.cargo);
        const badge = document.createElement('span');
        badge.className = 'convidado-cargo' + (cargo ? '' : ' sem-cargo');
        badge.textContent = cargo ? cargo.nome : 'Sem cargo';

        item.append(nome, email, badge);
        item.addEventListener('click', () => abrirConvite(conv));
        listaConvidados.appendChild(item);
    });
}


/* Modal de convite */
function preencherCargos(selecionado) {
    campos.cargo.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecione o cargo';
    campos.cargo.appendChild(placeholder);

    cargos.forEach(c => {
        const op = document.createElement('option');
        op.value = c.id;
        op.textContent = c.nome;
        campos.cargo.appendChild(op);
    });

    campos.cargo.value = selecionado || '';
    avisoCargo.classList.toggle('d-none', cargos.length > 0);
}

function abrirConvite(convidado) {
    alvoId = convidado ? convidado.id : null;
    formConvite.reset();
    campos.email.setCustomValidity('');
    preencherCargos(convidado ? convidado.cargo : '');

    if (convidado) {
        tituloConvite.textContent = 'Editar convidado';
        btnSalvarConvite.textContent = 'Salvar';
        btnExcluirConvidado.classList.remove('d-none');
        campos.nome.value = convidado.nome;
        campos.email.value = convidado.email;
    } else {
        tituloConvite.textContent = 'Convidar usuário';
        btnSalvarConvite.textContent = 'Convidar';
        btnExcluirConvidado.classList.add('d-none');
    }

    modalConvite.show();
}

modalConviteEl.addEventListener('shown.bs.modal', () => campos.nome.focus());
campos.email.addEventListener('input', () => campos.email.setCustomValidity(''));

document.getElementById('btn-convidar').addEventListener('click', () => abrirConvite(null));

formConvite.addEventListener('submit', e => {
    e.preventDefault();

    if (cargos.length === 0) {
        avisoCargo.classList.remove('d-none');
        return;
    }

    const email = campos.email.value.trim().toLowerCase();
    const repetido = convidados.some(c => c.email.toLowerCase() === email && c.id !== alvoId);
    campos.email.setCustomValidity(repetido ? 'Este e-mail já foi convidado.' : '');

    if (!formConvite.checkValidity() || campos.nome.value.trim() === '') {
        formConvite.reportValidity();
        return;
    }

    const dados = {
        nome: campos.nome.value.trim(),
        email: campos.email.value.trim(),
        cargo: campos.cargo.value
    };

    if (alvoId) {
        const existente = convidados.find(c => c.id === alvoId);
        if (existente) Object.assign(existente, dados);
    } else {
        convidados.push(Object.assign({ id: novoId() }, dados));
    }

    salvar();
    renderConvidados();
    modalConvite.hide();
});

btnExcluirConvidado.addEventListener('click', () => {
    if (!alvoId || !confirm('Remover este convidado?')) return;

    convidados = convidados.filter(c => c.id !== alvoId);
    salvar();
    renderConvidados();
    modalConvite.hide();
});


/* Cargos */
function renderCargos() {
    listaCargos.innerHTML = '';

    if (cargos.length === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'text-secondary small mb-0';
        vazio.textContent = 'Nenhum cargo criado ainda.';
        listaCargos.appendChild(vazio);
        return;
    }

    cargos.forEach(cargo => {
        const linha = document.createElement('div');
        linha.className = 'cargo-item';

        const nome = document.createElement('span');
        nome.textContent = cargo.nome;

        const excluir = document.createElement('button');
        excluir.type = 'button';
        excluir.className = 'btn btn-sm btn-outline-danger';
        excluir.textContent = 'Excluir';
        excluir.addEventListener('click', () => excluirCargo(cargo));

        linha.append(nome, excluir);
        listaCargos.appendChild(linha);
    });
}

function excluirCargo(cargo) {
    const emUso = convidados.filter(c => c.cargo === cargo.id).length;
    let msg = 'Excluir o cargo "' + cargo.nome + '"?';
    if (emUso > 0) {
        msg += '\n' + emUso + ' convidado(s) ficarão sem cargo.';
    }
    if (!confirm(msg)) return;

    cargos = cargos.filter(c => c.id !== cargo.id);
    convidados.forEach(c => { if (c.cargo === cargo.id) c.cargo = ''; });
    salvar();
    renderCargos();
    renderConvidados();
}

function mostrarErroCargo(texto) {
    erroCargo.textContent = texto;
    erroCargo.classList.toggle('d-none', texto === '');
}

document.getElementById('btn-criar-cargo').addEventListener('click', () => {
    inputCargo.value = '';
    mostrarErroCargo('');
    renderCargos();
    modalCargos.show();
});

modalCargosEl.addEventListener('shown.bs.modal', () => inputCargo.focus());
inputCargo.addEventListener('input', () => mostrarErroCargo(''));

formCargo.addEventListener('submit', e => {
    e.preventDefault();

    const nome = inputCargo.value.trim();
    if (nome === '') {
        mostrarErroCargo('Digite o nome do cargo.');
        return;
    }
    if (cargos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
        mostrarErroCargo('Esse cargo já existe.');
        return;
    }

    cargos.push({ id: novoId(), nome: nome });
    salvar();
    inputCargo.value = '';
    mostrarErroCargo('');
    renderCargos();
    inputCargo.focus();
});


/* Inicialização */
renderConvidados();