const { PrismaClient } = require("@prisma/client");
const path = require("path");

// Carrega o .env da raiz do projeto
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Agora o PrismaClient() vai ler 'process.env.DATABASE_URL'
const prisma = new PrismaClient();

module.exports = prisma;
