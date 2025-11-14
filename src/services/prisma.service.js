// src/services/prisma.service.js

// Esta função "adivinha" a prioridade de dados antigos
exports.inferirPrioridade = (diagnostico, transcricao) => {
	if (!diagnostico || !transcricao) return "Média"; // Padrão

	const textoCompleto = (diagnostico + " " + transcricao).toLowerCase();

	// Palavras-chave que aumentam a prioridade
	const keywordsAlta = [
		"grave",
		"intensa",
		"severa",
		"súbita",
		"falta de ar",
		"dor no peito",
		"emergência",
		"urgente",
		"desmaio",
		"confusão",
		"febre alta",
		"risco de vida",
	];
	for (const keyword of keywordsAlta) {
		if (textoCompleto.includes(keyword)) return "Alta";
	}

	// Palavras-chave que diminuem a prioridade
	const keywordsBaixa = [
		"rotina",
		"check-up",
		"leve",
		"resfriado",
		"acompanhamento",
		"simples",
		"preventivo",
		"exame de rotina",
	];
	for (const keyword of keywordsBaixa) {
		if (textoCompleto.includes(keyword)) return "Baixa";
	}

	// Se não for alta nem baixa, é média
	return "Média";
};
