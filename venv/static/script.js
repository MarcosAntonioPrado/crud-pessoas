// script.js
const API_URL = '/pessoas';
const formPessoa = document.getElementById('formPessoa');
const idPessoaInput = document.getElementById('idPessoa');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const tabelaPessoasBody = document.getElementById('tabelaPessoas');
const statusMensagem = document.getElementById('statusMensagem');

document.addEventListener('DOMContentLoaded', () => {
    carregarPessoas();
    formPessoa.addEventListener('submit', salvarPessoa);
    btnCancelar.addEventListener('click', resetarFormulario);
});

async function exibirMensagem(mensagem, tipo) {
    statusMensagem.textContent = mensagem;
    statusMensagem.className = `mensagem ${tipo}`; // Adiciona a classe de tipo (success ou error)
    statusMensagem.style.display = 'block';
    setTimeout(() => {
        statusMensagem.style.display = 'none';
        statusMensagem.textContent = '';
    }, 3000); // Esconde a mensagem após 3 segundos
}

async function carregarPessoas() {
    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) {
            const errorData = await resp.json();
            exibirMensagem(`Erro ao carregar pessoas: ${errorData.erro || resp.statusText}`, 'error');
            return;
        }
        const pessoas = await resp.json();

        tabelaPessoasBody.innerHTML = '';
        if (pessoas.length === 0) {
            tabelaPessoasBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma pessoa cadastrada.</td></tr>';
            return;
        }

        pessoas.forEach(p => {
            const linha = `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.nome}</td>
                    <td>${p.email}</td>
                    <td class="actions">
                        <button onclick="editarPessoa(${p.id}, '${p.nome.replace(/'/g, "\'")}', '${p.email.replace(/'/g, "\'")}')">✏️ Editar</button>
                        <button onclick="deletarPessoa(${p.id})">🗑️ Excluir</button>
                    </td>
                </tr>
            `;
            tabelaPessoasBody.innerHTML += linha;
        });
    } catch (error) {
        exibirMensagem(`Erro de conexão ao carregar pessoas: ${error.message}`, 'error');
    }
}

async function salvarPessoa(event) {
    event.preventDefault();

    const id = idPessoaInput.value;
    const nome = nomeInput.value;
    const email = emailInput.value;

    const pessoa = { nome, email };
    let method = 'POST';
    let url = API_URL;

    if (id) {
        method = 'PUT';
        url = `${API_URL}/${id}`;
    }

    try {
        const resp = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pessoa)
        });

        if (!resp.ok) {
            const errorData = await resp.json();
            exibirMensagem(`Erro ao salvar pessoa: ${errorData.erro || resp.statusText}`, 'error');
            return;
        }

        exibirMensagem(`Pessoa ${id ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        resetarFormulario();
        carregarPessoas();
    } catch (error) {
        exibirMensagem(`Erro de conexão ao salvar pessoa: ${error.message}`, 'error');
    }
}

function editarPessoa(id, nome, email) {
    idPessoaInput.value = id;
    nomeInput.value = nome;
    emailInput.value = email;
    btnSalvar.textContent = 'Atualizar';
    btnCancelar.style.display = 'inline-block';
}

async function deletarPessoa(id) {
    if (!confirm('Deseja realmente excluir esta pessoa?')) {
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (!resp.ok) {
            const errorData = await resp.json();
            exibirMensagem(`Erro ao excluir pessoa: ${errorData.erro || resp.statusText}`, 'error');
            return;
        }

        exibirMensagem('Pessoa excluída com sucesso!', 'success');
        carregarPessoas();
    } catch (error) {
        exibirMensagem(`Erro de conexão ao excluir pessoa: ${error.message}`, 'error');
    }
}

function resetarFormulario() {
    formPessoa.reset();
    idPessoaInput.value = '';
    btnSalvar.textContent = 'Salvar';
    btnCancelar.style.display = 'none';
}