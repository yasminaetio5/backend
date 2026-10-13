const API_URL = 'http://localhost:3000/api/alunos';

const form = document.getElementById('aluno-form');
const tbody = document.getElementById('alunos-tbody');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

const inputId = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputIdade = document.getElementById('idade');
const inputCurso = document.getElementById('curso');

let editandoId = null;

// LER (GET)
async function carregarAlunos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Erro ao buscar alunos');
        }

        const alunos = await resposta.json();
        tbody.innerHTML = '';

        if (alunos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center">
                        Nenhum aluno cadastrado.
                    </td>
                </tr>
            `;
            return;
        }

        alunos.forEach(aluno => {
            const tr = document.createElement('tr');

            const valores = [
                `#${aluno.id}`,
                aluno.nome,
                aluno.email,
                aluno.idade ?? '',
                aluno.curso
            ];

            valores.forEach(valor => {
                const td = document.createElement('td');
                td.textContent = valor;
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'action';

            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-icon btn-edit';
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => iniciarEdicao(aluno));

            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-icon btn-delete';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.addEventListener('click', () => deletarAluno(aluno.id));

            tdAcoes.append(btnEditar, btnExcluir);
            tr.appendChild(tdAcoes);
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error('Erro ao buscar alunos:', erro);
        alert('Erro de conexão com o servidor!');
    }
}

// SALVAR (POST) E EDITAR (PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const aluno = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        idade: Number(inputIdade.value),
        curso: inputCurso.value
    };

    try {
        const url = editandoId
            ? `${API_URL}/${editandoId}`
            : API_URL;

        const resposta = await fetch(url, {
            method: editandoId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(aluno)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || erro.erro || 'Erro ao salvar aluno');
        }

        resetarFormulario();
        await carregarAlunos();

    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        alert(erro.message || 'Erro ao salvar os dados no servidor!');
    }
});

// INICIAR EDIÇÃO
function iniciarEdicao(aluno) {
    editandoId = aluno.id;

    inputId.value = aluno.id;
    inputNome.value = aluno.nome;
    inputEmail.value = aluno.email;
    inputIdade.value = aluno.idade ?? '';
    inputCurso.value = aluno.curso;

    btnSave.textContent = 'Atualizar Aluno';
    btnCancel.style.display = 'inline-block';
    form.scrollIntoView({ behavior: 'smooth' });
}

// CANCELAR EDIÇÃO
btnCancel.addEventListener('click', resetarFormulario);

function resetarFormulario() {
    form.reset();
    inputId.value = '';
    editandoId = null;
    btnSave.textContent = 'Salvar Aluno';
    btnCancel.style.display = 'none';
}

// EXCLUIR (DELETE)
async function deletarAluno(id) {
    if (!confirm('Deseja realmente excluir este aluno?')) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error('Erro ao excluir aluno');
        }

        await carregarAlunos();

    } catch (erro) {
        console.error('Erro ao excluir:', erro);
        alert('Erro ao excluir o aluno!');
    }
}

// Carregar a lista ao abrir a página
carregarAlunos();