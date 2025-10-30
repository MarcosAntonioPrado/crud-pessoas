# app.py

import os
from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

# Determina o diretório base do projeto para criar o caminho do DB
basedir = os.path.abspath(os.path.dirname(__file__))

# --- 1. INICIALIZAÇÃO E CONFIGURAÇÃO ---
app = Flask(__name__)
# Configuração para o SQLAlchemy se conectar ao banco de dados SQLite
# O arquivo 'database.db' será criado na pasta do projeto
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
# Desativa um recurso de tracking do SQLAlchemy que não usaremos e consome memória
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Cria a instância do SQLAlchemy, conectando-a ao nosso app Flask
db = SQLAlchemy(app)

# --- 2. MODELO DE DADOS ---
# Define a estrutura da nossa tabela 'Pessoa' no banco de dados
class Pessoa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)

    # Função para converter o objeto Pessoa em um dicionário (formato JSON)
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email
        }

# --- 3. ROTAS PARA SERVIR O FRONTEND ---
@app.route('/')
def index():
    # Renderiza o template index.html que está na pasta 'templates'
    return render_template('index.html')

# --- 4. ROTAS DO CRUD (API) ---

# Rota para CRIAR uma nova pessoa (POST)
@app.route('/pessoas', methods=['POST'])
def criar_pessoa():
    dados = request.get_json()
    if not dados or not 'nome' in dados or not 'email' in dados:
        # Erro 400: Requisição inválida se faltarem dados
        return jsonify({'erro': 'Dados incompletos: nome e email são obrigatórios.'}), 400
    
    # Verifica se o email já existe para evitar duplicidade, pois o campo é unique=True
    if Pessoa.query.filter_by(email=dados['email']).first():
        return jsonify({'erro': f"Email '{dados['email']}' já cadastrado."}), 409 # 409 Conflict

    nova_pessoa = Pessoa(nome=dados['nome'], email=dados['email'])
    db.session.add(nova_pessoa)
    db.session.commit()
    # Retorna o objeto criado com o ID gerado pelo banco
    return jsonify(nova_pessoa.to_dict()), 201 # 201 Created

# Rota para LER todas as pessoas (GET)
@app.route('/pessoas', methods=['GET'])
def listar_pessoas():
    pessoas = Pessoa.query.all()
    # Converte a lista de objetos Pessoa em uma lista de dicionários JSON
    return jsonify([pessoa.to_dict() for pessoa in pessoas])

# Rota para LER uma pessoa específica pelo ID (GET)
@app.route('/pessoas/<int:id>', methods=['GET'])
def obter_pessoa(id):
    # Busca a pessoa pelo ID ou retorna 404 se não encontrar
    pessoa = Pessoa.query.get_or_404(id)
    return jsonify(pessoa.to_dict())

# Rota para ATUALIZAR uma pessoa (PUT)
@app.route('/pessoas/<int:id>', methods=['PUT'])
def atualizar_pessoa(id):
    pessoa = Pessoa.query.get_or_404(id)
    dados = request.get_json()

    if not dados:
        return jsonify({'erro': 'Nenhum dado fornecido para atualização.'}), 400

    # Atualiza apenas os campos que foram enviados na requisição
    if 'nome' in dados:
        pessoa.nome = dados['nome']
    if 'email' in dados:
        # Verifica se o novo email já existe para outra pessoa
        if Pessoa.query.filter(Pessoa.email == dados['email'], Pessoa.id != id).first():
            return jsonify({'erro': f"Email '{dados['email']}' já cadastrado por outra pessoa."}), 409
        pessoa.email = dados['email']
            
    db.session.commit()
    return jsonify(pessoa.to_dict())

# Rota para DELETAR uma pessoa (DELETE)
@app.route('/pessoas/<int:id>', methods=['DELETE'])
def deletar_pessoa(id):
    pessoa = db.session.get(Pessoa, id) # Use db.session.get para Python 3.9+ e SQLAlchemy 1.4+
    if pessoa is None:
        return jsonify({'erro': 'Pessoa não encontrada.'}), 404
        
    db.session.delete(pessoa)
    db.session.commit()
    return jsonify({'mensagem': 'Pessoa deletada com sucesso.'}), 200 # 200 OK para sucesso na exclusão

# --- Bloco para execução ---
if __name__ == '__main__':
    # Cria o banco de dados e as tabelas antes de rodar a aplicação pela primeira vez
    with app.app_context():
        db.create_all() # Isso cria o arquivo database.db e as tabelas nele
    app.run(debug=True) # Roda o servidor Flask em modo de depuração