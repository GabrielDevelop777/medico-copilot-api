// src/controllers/consulta.controller.js
const prisma = require("../db/prisma"); // Nosso cliente Prisma
const gemini = require("../services/gemini.service"); // Nosso serviço de IA
const { inferirPrioridade } = require("../services/prisma.service");

// O 'next' é o nosso "segurança" (o errorHandler)
// Se algo der erro, chamamos next(error)

// --- CONTROLADOR DE TRANSCRIÇÃO ---
exports.handleTranscrever = async (req, res, next) => {
	console.log(`[LOG] Rota /transcrever: Recebido áudio.`);
	try {
		if (!req.file) {
			console.warn("[AVISO] /transcrever: Nenhum arquivo.");
			return res
				.status(400)
				.json({ error: "Nenhum arquivo de áudio enviado." });
		}

		// 1. Pega o buffer
		const audioBase64 = req.file.buffer.toString("base64");

		// 2. Chama o SERVIÇO de IA
		const transcricao = await gemini.transcreverAudio(audioBase64);

		// 3. Responde
		console.log(`[LOG] /transcrever: Transcrição concluída.`);
		res.json({ transcricao: transcricao });
	} catch (error) {
		console.error("🚨 [ERRO CRÍTICO] /transcrever:", error);
		next(error); // Envia o erro para o "segurança" (errorHandler)
	}
};

// --- CONTROLADOR DE ANÁLISE ---
exports.handleAnalisar = async (req, res, next) => {
	console.log(`[LOG] Rota /analisar: Iniciando análise.`);
	try {
		const { transcricao } = req.body;
		if (!transcricao) {
			return res.status(400).json({ error: "Transcrição é obrigatória." });
		}

		// 1. Chama o SERVIÇO de IA
		const analiseJson = await gemini.analisarConsulta(transcricao);

		// 2. (Lógica de negócio) Inferir prioridade se a IA falhar
		if (!analiseJson.prioridade) {
			analiseJson.prioridade = inferirPrioridade(
				analiseJson.diagnosticoSugerido,
				transcricao,
			);
		}

		// 3. Chama o SERVIÇO de Banco de Dados
		const novaConsulta = await prisma.consulta.create({
			data: {
				transcricao: transcricao,
				analise: JSON.stringify(analiseJson),
			},
		});

		// 4. Responde
		console.log(`[LOG] /analisar: Análise salva (ID: ${novaConsulta.id})`);
		res.json({
			success: true,
			consultaId: novaConsulta.id,
			analise: analiseJson,
		});
	} catch (error) {
		console.error("🚨 [ERRO CRÍTICO] /analisar:", error);
		next(error); // Envia para o "segurança"
	}
};

// --- CONTROLADOR DE HISTÓRICO ---
exports.handleGetHistorico = async (req, res, next) => {
	console.log(`[LOG] Rota /historico: Buscando dados...`);
	try {
		// 1. Chama o SERVIÇO de Banco de Dados
		const consultas = await prisma.consulta.findMany({
			orderBy: { data: "desc" },
		});

		// 2. (Lógica de negócio) Formata os dados e infere prioridade
		const historicoFormatado = consultas.map((c) => {
			const analise = JSON.parse(c.analise);
			if (!analise.prioridade) {
				analise.prioridade = inferirPrioridade(
					analise.diagnosticoSugerido,
					c.transcricao,
				);
			}
			return { ...c, analise: analise };
		});

		console.log(`[LOG] /historico: ${consultas.length} registros encontrados.`);
		res.json(historicoFormatado);
	} catch (error) {
		console.error("🚨 [ERRO CRÍTICO] /historico:", error);
		next(error); // Envia para o "segurança"
	}
};

// --- CONTROLADOR DE CHAT ---
exports.handleChat = async (req, res, next) => {
	console.log(`[LOG] Rota /chat: Recebida nova mensagem.`);
	try {
		const { mensagem, contexto } = req.body;
		if (!mensagem || !contexto) {
			return res
				.status(400)
				.json({ error: "Mensagem e contexto são obrigatórios." });
		}

		// 1. Chama o SERVIÇO de IA
		const resposta = await gemini.chatContextual(mensagem, contexto);

		console.log(`[LOG] /chat: Resposta da IA gerada.`);
		res.json({ resposta: resposta });
	} catch (error) {
		console.error("🚨 [ERRO CRÍTICO] /chat:", error);
		next(error); // Envia para o "segurança"
	}
};

// --- CONTROLADOR DE DELETE ---
exports.handleDelete = async (req, res, next) => {
	const { id } = req.params;
	console.log(`[LOG] Rota /delete: ID: ${id}`);
	try {
		// 1. Chama o SERVIÇO de Banco de Dados
		await prisma.consulta.delete({
			where: { id: id },
		});

		console.log(`[LOG] /delete: Consulta ID ${id} deletada.`);
		res.status(200).json({ success: true, message: "Consulta deletada" });
	} catch (error) {
		console.error("🚨 [ERRO CRÍTICO] /delete:", error);
		next(error); // Envia para o "segurança"
	}
};
