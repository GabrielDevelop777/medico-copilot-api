const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler"); // Importa o "segurança"

const app = express();

// Middlewares padrões
app.use(cors());
app.use(express.json());

// --- ROTAS PRINCIPAIS ---
// Qualquer requisição em /api será gerenciada pelo nosso roteador
app.use("/api", routes);

// --- MIDDLEWARE DE ERRO ---
// Este é o "segurança". Se qualquer rota der erro, ele vai cair aqui.
// Isso impede o servidor de crashar (erro 503, etc.)
app.use(errorHandler);

// Exporta o app para o server.js (ou Vercel)
module.exports = app;
