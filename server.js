// 1. Importação dos pacotes que instalamos
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Permite o uso de variáveis de ambiente do arquivo .env
require('dotenv').config();

// 2. Configuração inicial da aplicação
const app = express(); // Cria a aplicação Express
const port = process.env.PORT || 5000; // Define a porta do servidor

// 3. Middlewares (funções que rodam a cada requisição)
app.use(cors()); // Habilita o CORS para permitir requisições de outras origens (do nosso frontend)
app.use(express.json()); // Permite que o servidor entenda requisições com corpo no formato JSON

// 4. Conexão com o Banco de Dados (MongoDB Atlas)
const uri = process.env.MONGODB_URI; // Pega a string de conexão do arquivo .env
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("Conexão com o MongoDB Atlas estabelecida com sucesso.");
});

// 5. Rota de teste (para verificar se o servidor está funcionando)
app.get('/', (req, res) => {
    res.send('API do CRUD de Pessoas está funcionando!');
});

// Futuramente, as rotas do CRUD de pessoas virão aqui.

// 6. Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor está rodando na porta: ${port}`);
});