const express = require("express");
const multer = require("multer");
const consultaRouter = require("./consulta.routes");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// O roteador principal "monta" os outros
// Todas as rotas de consulta (analisar, historico, delete, chat)
// estão agora em 'consulta.routes.js'
router.use("/consulta", consultaRouter);

// Exporta o roteador montado
module.exports = router;
