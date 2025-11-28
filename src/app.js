const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos da aplicação front-end
// IMPORTANTE: Substitua '../client/dist' pelo caminho correto para a pasta de build do seu front-end
const frontEndPath = path.join(__dirname, "../../../medico-copilot/dist");
app.use(express.static(frontEndPath));

// Qualquer requisição em /api será gerenciada pelo nosso roteador
app.use("/api", routes);

// Este é o "segurança". Se qualquer rota der erro, ele vai cair aqui.
// Isso impede o servidor de crashar (erro 503, etc.)
app.use(errorHandler);

// Para qualquer outra rota que não seja de API, sirva o index.html do front-end
// Isso é necessário para que o roteamento do lado do cliente (client-side routing) funcione corretamente
app.get("*", (req, res) => {
	res.sendFile(path.join(frontEndPath, "index.html"));
});

module.exports = app;
