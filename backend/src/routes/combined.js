// ── torneos.js ────────────────────────────────────────────────────────
import { Router }       from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const prisma = new PrismaClient()

export const torneoRoutes = Router()

torneoRoutes.get('/', authMiddleware, async (req, res) => {
  const torneos = await prisma.torneo.findMany({
    include: { categoria: true },
    orderBy: { id: 'desc' }
  })
  res.json(torneos)
})

torneoRoutes.get('/:id', authMiddleware, async (req, res) => {
  const torneo = await prisma.torneo.findUnique({
    where: { id: Number(req.params.id) },
    include: { categoria: true, clubs: { include: { club: true } } }
  })
  res.json(torneo)
})

torneoRoutes.get('/:id/posiciones', authMiddleware, async (req, res) => {
  // Calcular posiciones desde los partidos del torneo
  const partidos = await prisma.partido.findMany({
    where: { torneoId: Number(req.params.id), cerrado: true },
    include: { equipoLocal: true, equipoVisitante: true }
  })

  const tabla = {}
  for (const p of partidos) {
    const li = p.equipoLocalId, vi = p.equipoVisId
    if (!li || !vi) continue
    if (!tabla[li]) tabla[li] = { equipo: p.equipoLocal, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, pts:0 }
    if (!tabla[vi]) tabla[vi] = { equipo: p.equipoVisitante, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, pts:0 }

    tabla[li].pj++; tabla[vi].pj++
    tabla[li].gf += p.golesLocal;     tabla[li].gc += p.golesVisitante
    tabla[vi].gf += p.golesVisitante; tabla[vi].gc += p.golesLocal

    if (p.golesLocal > p.golesVisitante) {
      tabla[li].pg++; tabla[li].pts += 3; tabla[vi].pp++
    } else if (p.golesLocal < p.golesVisitante) {
      tabla[vi].pg++; tabla[vi].pts += 3; tabla[li].pp++
    } else {
      tabla[li].pe++; tabla[li].pts++; tabla[vi].pe++; tabla[vi].pts++
    }
  }

  const posiciones = Object.values(tabla)
    .map(t => ({ ...t, dif: t.gf - t.gc }))
    .sort((a, b) => b.pts - a.pts || b.dif - a.dif)

  res.json(posiciones)
})

torneoRoutes.post('/', authMiddleware, async (req, res) => {
  const torneo = await prisma.torneo.create({ data: req.body })
  res.status(201).json(torneo)
})

// ── categorias.js ─────────────────────────────────────────────────────
export const categoriaRoutes = Router()

categoriaRoutes.get('/', authMiddleware, async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    include: { tipoCategoria: true },
    orderBy: { nombre: 'asc' }
  })
  res.json(categorias)
})

categoriaRoutes.post('/', authMiddleware, async (req, res) => {
  const cat = await prisma.categoria.create({ data: req.body })
  res.status(201).json(cat)
})

categoriaRoutes.put('/:id', authMiddleware, async (req, res) => {
  const cat = await prisma.categoria.update({ where: { id: Number(req.params.id) }, data: req.body })
  res.json(cat)
})

// ── cuotas.js ─────────────────────────────────────────────────────────
export const cuotaRoutes = Router()

cuotaRoutes.post('/', authMiddleware, async (req, res) => {
  try {
    const cuota = await prisma.cuota.create({
      data: { ...req.body, fecha: new Date(req.body.fecha) }
    })
    res.status(201).json(cuota)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'La cuota de ese mes/año ya existe' })
    res.status(500).json({ message: err.message })
  }
})

cuotaRoutes.delete('/:id', authMiddleware, async (req, res) => {
  await prisma.cuota.delete({ where: { id: Number(req.params.id) } })
  res.json({ message: 'Cuota eliminada' })
})

// ── asistencias.js ────────────────────────────────────────────────────
export const asistenciaRoutes = Router()

asistenciaRoutes.get('/', authMiddleware, async (req, res) => {
  const { desde, hasta } = req.query
  const where = {}
  if (desde) where.fecha = { gte: new Date(desde) }
  if (hasta) where.fecha = { ...where.fecha, lte: new Date(hasta) }

  const asistencias = await prisma.asistencia.findMany({
    where, orderBy: { fecha: 'desc' },
    include: { personas: { include: { persona: { select: { id: true, apellido: true, nombre: true } } } } }
  })
  res.json(asistencias)
})

asistenciaRoutes.post('/', authMiddleware, async (req, res) => {
  const { personas, ...data } = req.body
  const asistencia = await prisma.asistencia.create({
    data: {
      ...data,
      fecha: new Date(data.fecha),
      personas: personas?.length
        ? { create: personas.map(personaId => ({ personaId })) }
        : undefined
    }
  })
  res.status(201).json(asistencia)
})

// ── estadisticas.js ───────────────────────────────────────────────────
export const estadisticaRoutes = Router()

estadisticaRoutes.get('/resumen', authMiddleware, async (req, res) => {
  const [jugadores, torneos, partidos, golesData] = await Promise.all([
    prisma.persona.count({ where: { estado: true } }),
    prisma.torneo.count(),
    prisma.partido.count({ where: { cerrado: true } }),
    prisma.plantelPartido.aggregate({ _sum: { goles: true } })
  ])
  res.json({
    jugadores,
    torneos,
    partidos,
    goles: golesData._sum.goles || 0
  })
})

estadisticaRoutes.get('/goleadores', authMiddleware, async (req, res) => {
  const { torneoId, limit = 10 } = req.query
  const where = {}
  if (torneoId) where.partido = { torneoId: Number(torneoId) }

  const goleadores = await prisma.plantelPartido.groupBy({
    by: ['personaId'],
    where: { goles: { gt: 0 }, ...where },
    _sum: { goles: true },
    orderBy: { _sum: { goles: 'desc' } },
    take: Number(limit)
  })

  const conNombres = await Promise.all(
    goleadores.map(async g => {
      const p = await prisma.persona.findUnique({
        where: { id: g.personaId },
        select: { id: true, nombre: true, apellido: true, alias: true }
      })
      return { ...p, goles: g._sum.goles }
    })
  )
  res.json(conNombres)
})

estadisticaRoutes.get('/jugador/:id', authMiddleware, async (req, res) => {
  const historial = await prisma.plantelPartido.findMany({
    where: { personaId: Number(req.params.id) },
    include: {
      partido: {
        include: {
          torneo:          { select: { nombre: true } },
          equipoLocal:     { select: { nombre: true } },
          equipoVisitante: { select: { nombre: true } },
        }
      }
    },
    orderBy: { partido: { fecha: 'desc' } }
  })
  res.json(historial)
})
