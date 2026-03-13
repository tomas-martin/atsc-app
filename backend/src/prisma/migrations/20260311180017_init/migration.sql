-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "usuario" VARCHAR(30) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "tipoId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" SERIAL NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "apellido" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "alias" VARCHAR(30),
    "completo" VARCHAR(60),
    "documento" VARCHAR(15),
    "nroCarnet" VARCHAR(20),
    "carnet" VARCHAR(30),
    "fechaNac" DATE,
    "domicilio" VARCHAR(60),
    "localidad" VARCHAR(30),
    "grupo" VARCHAR(5),
    "obraSocial" VARCHAR(30),
    "telefono" VARCHAR(20),
    "telefono1" VARCHAR(20),
    "telefono2" VARCHAR(20),
    "foto" VARCHAR(255),
    "mail" VARCHAR(60),
    "mail2" VARCHAR(60),
    "nroSocio" INTEGER,
    "asistencia" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_persona" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,

    CONSTRAINT "tipos_persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas_tipos" (
    "personaId" INTEGER NOT NULL,
    "tipoId" INTEGER NOT NULL,

    CONSTRAINT "personas_tipos_pkey" PRIMARY KEY ("personaId","tipoId")
);

-- CreateTable
CREATE TABLE "puestos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "fecha" VARCHAR(20),
    "campeon" INTEGER,
    "campeon1" INTEGER,
    "campeon2" INTEGER,
    "categoriaId" INTEGER,

    CONSTRAINT "torneos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_categoria" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,

    CONSTRAINT "tipos_categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "direccion" VARCHAR(100),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneos_clubs" (
    "torneoId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,

    CONSTRAINT "torneos_clubs_pkey" PRIMARY KEY ("torneoId","clubId")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "campeonato" INTEGER,
    "clubId" INTEGER,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "tipoCategoriaId" INTEGER,
    "clase" VARCHAR(10),
    "hasta" INTEGER,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha" DATE,
    "torneoId" INTEGER,
    "fefusa" VARCHAR(20),
    "letra" VARCHAR(5),
    "dt" VARCHAR(60),
    "ac" VARCHAR(60),
    "pf" VARCHAR(60),

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "fechaNro" INTEGER,
    "torneoId" INTEGER,
    "equipoLocalId" INTEGER,
    "golesLocal" INTEGER NOT NULL DEFAULT 0,
    "equipoVisId" INTEGER,
    "golesVisitante" INTEGER NOT NULL DEFAULT 0,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "video" VARCHAR(255),
    "foto" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantel_partidos" (
    "id" SERIAL NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "personaId" INTEGER NOT NULL,
    "alias" VARCHAR(30),
    "nroCamiseta" INTEGER,
    "goles" INTEGER NOT NULL DEFAULT 0,
    "amarillas" INTEGER NOT NULL DEFAULT 0,
    "azules" INTEGER NOT NULL DEFAULT 0,
    "faltas" INTEGER NOT NULL DEFAULT 0,
    "suspendido" BOOLEAN NOT NULL DEFAULT false,
    "capitan" BOOLEAN NOT NULL DEFAULT false,
    "pt_inicio" INTEGER,
    "pt_fin" INTEGER,
    "st_inicio" INTEGER,
    "st_fin" INTEGER,

    CONSTRAINT "plantel_partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicio" VARCHAR(8),
    "horaFin" VARCHAR(8),
    "tipoCategoriaId" INTEGER,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias_personas" (
    "asistenciaId" INTEGER NOT NULL,
    "personaId" INTEGER NOT NULL,

    CONSTRAINT "asistencias_personas_pkey" PRIMARY KEY ("asistenciaId","personaId")
);

-- CreateTable
CREATE TABLE "pases" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "clubOrigen" VARCHAR(60),
    "clubDestino" VARCHAR(60),
    "monto" DECIMAL(10,2),
    "observacion" TEXT,
    "imagen" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camisetas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "detalle" VARCHAR(100),
    "tipoCategoriaId" INTEGER,
    "responsable" VARCHAR(60),
    "marca" VARCHAR(30),
    "tipo" VARCHAR(20),
    "fecha" DATE,
    "cantidad" INTEGER,
    "cantPantalon" INTEGER,

    CONSTRAINT "camisetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camisetas_numeros" (
    "id" SERIAL NOT NULL,
    "camisetaId" INTEGER NOT NULL,
    "nro" INTEGER,
    "pecho" VARCHAR(5),
    "pantalon" VARCHAR(5),
    "estado" VARCHAR(20),

    CONSTRAINT "camisetas_numeros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "detalle" TEXT,
    "fecha" DATE NOT NULL,
    "imagen" VARCHAR(255),
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" SERIAL NOT NULL,
    "linea1" VARCHAR(255),
    "linea2" VARCHAR(255),
    "linea3" VARCHAR(255),

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evento" VARCHAR(255) NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_personaId_mes_anio_key" ON "cuotas"("personaId", "mes", "anio");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas_tipos" ADD CONSTRAINT "personas_tipos_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas_tipos" ADD CONSTRAINT "personas_tipos_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "tipos_categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos_clubs" ADD CONSTRAINT "torneos_clubs_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos_clubs" ADD CONSTRAINT "torneos_clubs_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_tipoCategoriaId_fkey" FOREIGN KEY ("tipoCategoriaId") REFERENCES "tipos_categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipoLocalId_fkey" FOREIGN KEY ("equipoLocalId") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipoVisId_fkey" FOREIGN KEY ("equipoVisId") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantel_partidos" ADD CONSTRAINT "plantel_partidos_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantel_partidos" ADD CONSTRAINT "plantel_partidos_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_personas" ADD CONSTRAINT "asistencias_personas_asistenciaId_fkey" FOREIGN KEY ("asistenciaId") REFERENCES "asistencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_personas" ADD CONSTRAINT "asistencias_personas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pases" ADD CONSTRAINT "pases_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camisetas_numeros" ADD CONSTRAINT "camisetas_numeros_camisetaId_fkey" FOREIGN KEY ("camisetaId") REFERENCES "camisetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
