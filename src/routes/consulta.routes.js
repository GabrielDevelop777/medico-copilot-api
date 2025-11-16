const express = require("express");
const multer = require("multer");
const controller = require("../controllers/consulta.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rota de Transcrição
// POST /api/consulta/transcrever
router.post(
	"/transcrever",
	upload.single("audio"),
	controller.handleTranscrever,
);

// Rota de Análise
// POST /api/consulta/analisar
router.post("/analisar", controller.handleAnalisar);

// Rota de Histórico
// GET /api/consulta/historico
router.get("/historico", controller.handleGetHistorico);

// Rota de Chat
// POST /api/consulta/chat
router.post("/chat", controller.handleChat);

// Rota de Delete
// DELETE /api/consulta/:id
router.delete("/:id", controller.handleDelete);

module.exports = router;
