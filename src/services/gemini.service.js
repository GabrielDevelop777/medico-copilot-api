// src/services/gemini.service.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = "gemini-2.5-flash"; // O nome do modelo que funciona

// --- SERVIÇO 1: Transcrição ---
exports.transcreverAudio = async (audioBase64) => {
	const model = genAI.getGenerativeModel({ model: modelName });
	const prompt =
		"Transcreva este áudio médico fielmente. Retorne apenas o texto transcrito, sem comentários adicionais.";

	const result = await model.generateContent([
		prompt,
		{ inlineData: { mimeType: "audio/webm", data: audioBase64 } },
	]);

	const response = await result.response;
	return response.text();
};

// --- SERVIÇO 2: Análise ---
exports.analisarConsulta = async (transcricao) => {
	const systemPrompt = `Você é um assistente médico sênior. Analise a transcrição e retorne APENAS um JSON válido (sem markdown) neste formato:
  {
    "diagnosticoSugerido": "texto",
    "examesRecomendados": ["item1", "item2"],
    "medicamentosSugeridos": ["itemitem1", "item2"],
    "observacoes": "texto",
    "prioridade": "Alta" | "Média" | "Baixa"
  }
  Diretriz de Prioridade:
  - "Alta": Sinais graves (dor no peito, falta de ar, confusão, febre alta).
  - "Média": Condições que precisam de acompanhamento (infecção, dor crônica).
  - "Baixa": Check-up, sintomas leves.
  Transcrição: ${transcricao}`;

	const model = genAI.getGenerativeModel({ model: modelName });
	const result = await model.generateContent(systemPrompt);
	const response = await result.response;
	let text = response.text();
	text = text
		.replace(/```json/g, "")
		.replace(/```/g, "")
		.trim();

	return JSON.parse(text);
};

// --- SERVIÇO 3: Chat ---
exports.chatContextual = async (mensagem, contexto) => {
	let systemPrompt = "";
	const lowerCaseMsg = mensagem.toLowerCase();

	if (
		lowerCaseMsg.includes("atestado") ||
		lowerCaseMsg.includes("declaração de comparecimento")
	) {
		console.log("[LOG] /chat: Detectado pedido de ATESTADO.");
		systemPrompt = `
    Você é um assistente administrativo médico... (prompt do atestado)
    Retorne APENAS um JSON válido...
    {
      "tipo": "ATESTADO",
      "nomePaciente": "INFERIR DO CONTEXTO OU USAR '[NOME DO PACIENTE]'",
      "diasAfastamento": "INFERIR DA MENSAGEM (ex: '3 dias' ou '1 dia')",
      "dataInicio": "${new Date().toLocaleDateString("pt-BR")}",
      "cid": "INFERIR DO CONTEXTO (ex: A09, J03.9) ou deixar em branco",
      "nomeMedico": "Dr. Assistente Copilot",
      "crm": "CRM/SP 123456"
    }
    CONTEXTO: ${JSON.stringify(contexto)}
    PEDIDO: "${mensagem}"
    `;
	} else {
		console.log("[LOG] /chat: Mensagem de chat padrão.");
		systemPrompt = `
    Você é um assistente médico sênior... (prompt do chat padrão)
    CONTEXTO: ${JSON.stringify(contexto)}
    PERGUNTA: "${mensagem}"
    `;
	}

	const model = genAI.getGenerativeModel({ model: modelName });
	const result = await model.generateContent(systemPrompt);
	const response = await result.response;

	return response.text();
};
