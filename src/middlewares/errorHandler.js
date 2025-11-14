const errorHandler = (err, req, res, next) => {
	console.error("🚫 OCORREU UM ERRO GLOBAL 🚫");
	console.error(err);

	// Verifica se é um erro do Google (como 503 Overloaded)
	if (err.status && err.statusText) {
		return res.status(err.status).json({
			error: "Erro de serviço externo",
			message: err.statusText, // Ex: 'Service Unavailable'
		});
	}

	// Erro genérico
	res.status(500).json({
		error: "Erro Interno do Servidor",
		message: err.message || "Algo quebrou no servidor.",
	});
};

module.exports = errorHandler;
