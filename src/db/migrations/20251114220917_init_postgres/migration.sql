-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "transcricao" TEXT NOT NULL,
    "analise" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);
