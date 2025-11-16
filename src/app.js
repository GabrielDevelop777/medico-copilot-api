const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Qualquer requisição em /api será gerenciada pelo nosso roteador
app.use("/api", routes);

// Este é o "segurança". Se qualquer rota der erro, ele vai cair aqui.
// Isso impede o servidor de crashar (erro 503, etc.)
app.use(errorHandler);

module.exports = app;
