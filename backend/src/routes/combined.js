// ── torneos.js ────────────────────────────────────────────────────────
import { Router }       from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const prisma = new PrismaClient()

// ID del equipo ATSC en la base de datos
const ATSC_EQUIPO_NOMBRES = ['TALLERES', 'ANDES TALLERES', 'TALLERES B', 'ANDES TALLERES B']

export const torneoRoutes = Router()

// GET /api/torneos — con filtros
torneoRoutes.get('/', authMiddleware, async (req, res) => {
  try {
    const { anio, categoria, nombre, estado } = req.query
    const where = {}
    if (anio)      where.fecha = anio
    if (nombre)    where.nombre = { contains: nombre, mode: 'insensitive' }
    if (categoria) where.categoriaId = Number(categoria)

    const torneos = await prisma.torneo.findMany({
      where,
      include: { categoria: true },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }]
    })
    res.json(torneos)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/torneos/:id
torneoRoutes.get('/:id', authMiddleware, async (req, res) => {
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id: Number(req.params.id) },
      include: { categoria: true, clubs: { include: { club: true } } }
    })
    res.json(torneo)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/torneos/:id/fixture — partidos agrupados por fecha
torneoRoutes.get('/:id/fixture', authMiddleware, async (req, res) => {
  try {
    const partidos = await prisma.partido.findMany({
      where: { torneoId: Number(req.params.id) },
      include: {
        equipoLocal:     { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
      },
      orderBy: [{ fechaNro: 'asc' }, { fecha: 'asc' }]
    })

    // Agrupar por fechaNro
    const fechas = {}
    for (const p of partidos) {
      const fn = p.fechaNro || 0
      if (!fechas[fn]) fechas[fn] = []
      fechas[fn].push(p)
    }

    const resultado = Object.entries(fechas)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([fechaNro, partidos]) => ({ fechaNro: Number(fechaNro), partidos }))

    res.json(resultado)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/torneos/:id/posiciones
torneoRoutes.get('/:id/posiciones', authMiddleware, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/torneos/:id/plantel — estadísticas acumuladas del plantel de ATSC
torneoRoutes.get('/:id/plantel', authMiddleware, async (req, res) => {
  try {
    // Buscar todos los partidos del torneo donde ATSC es local o visitante
    const equiposATSC = await prisma.equipo.findMany({
      where: {
        OR: ATSC_EQUIPO_NOMBRES.map(n => ({ nombre: { contains: n, mode: 'insensitive' } }))
      },
      select: { id: true, nombre: true }
    })
    const atscIds = equiposATSC.map(e => e.id)

    const partidos = await prisma.partido.findMany({
      where: {
        torneoId: Number(req.params.id),
        cerrado: true,
        OR: [
          { equipoLocalId: { in: atscIds } },
          { equipoVisId: { in: atscIds } }
        ]
      },
      select: { id: true }
    })
    const partidoIds = partidos.map(p => p.id)

    // Agrupar estadísticas por jugador
    const plantel = await prisma.plantelPartido.groupBy({
      by: ['personaId'],
      where: { partidoId: { in: partidoIds } },
      _sum: { goles: true, amarillas: true, azules: true, faltas: true },
      _count: { partidoId: true }
    })

    // Enriquecer con datos de persona
    const conNombres = await Promise.all(
      plantel.map(async p => {
        const persona = await prisma.persona.findUnique({
          where: { id: p.personaId },
          select: { id: true, apellido: true, nombre: true, foto: true, nroCarnet: true }
        })
        return {
          persona,
          pj:        p._count.partidoId,
          goles:     p._sum.goles     || 0,
          amarillas: p._sum.amarillas || 0,
          azules:    p._sum.azules    || 0,
          faltas:    p._sum.faltas    || 0,
        }
      })
    )

    conNombres.sort((a, b) => {
      if (!a.persona || !b.persona) return 0
      return a.persona.apellido.localeCompare(b.persona.apellido)
    })

    res.json(conNombres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/torneos/:id/historial — historial de ATSC en el torneo
torneoRoutes.get('/:id/historial', authMiddleware, async (req, res) => {
  try {
    const equiposATSC = await prisma.equipo.findMany({
      where: {
        OR: ATSC_EQUIPO_NOMBRES.map(n => ({ nombre: { contains: n, mode: 'insensitive' } }))
      },
      select: { id: true, nombre: true }
    })
    const atscIds = equiposATSC.map(e => e.id)

    const partidos = await prisma.partido.findMany({
      where: {
        torneoId: Number(req.params.id),
        OR: [
          { equipoLocalId: { in: atscIds } },
          { equipoVisId: { in: atscIds } }
        ]
      },
      include: {
        equipoLocal:     { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
      },
      orderBy: [{ fechaNro: 'asc' }, { fecha: 'asc' }]
    })

    // Calcular stats
    let ptsLocal = 0, pjLocal = 0, pgLocal = 0, peLocal = 0, ppLocal = 0, gfLocal = 0, gcLocal = 0
    let ptsVis = 0,   pjVis = 0,   pgVis = 0,   peVis = 0,   ppVis = 0,   gfVis = 0,   gcVis = 0

    const partidosConRol = partidos.map(p => {
      const esLocal = atscIds.includes(p.equipoLocalId)
      const cerrado = p.cerrado

      if (cerrado) {
        if (esLocal) {
          pjLocal++
          gfLocal += p.golesLocal; gcLocal += p.golesVisitante
          if (p.golesLocal > p.golesVisitante)      { pgLocal++; ptsLocal += 3 }
          else if (p.golesLocal < p.golesVisitante) { ppLocal++ }
          else                                      { peLocal++; ptsLocal++ }
        } else {
          pjVis++
          gfVis += p.golesVisitante; gcVis += p.golesLocal
          if (p.golesVisitante > p.golesLocal)      { pgVis++; ptsVis += 3 }
          else if (p.golesVisitante < p.golesLocal) { ppVis++ }
          else                                      { peVis++; ptsVis++ }
        }
      }

      return {
        ...p,
        esLocal,
        golesATSC:  esLocal ? p.golesLocal      : p.golesVisitante,
        golesRival: esLocal ? p.golesVisitante  : p.golesLocal,
        rival:      esLocal ? p.equipoVisitante : p.equipoLocal,
      }
    })

    const pjTotal  = pjLocal + pjVis
    const ptsTotal = ptsLocal + ptsVis

    res.json({
      partidos: partidosConRol,
      stats: {
        local:     { pts: ptsLocal, pj: pjLocal, pg: pgLocal, pe: peLocal, pp: ppLocal, gf: gfLocal, gc: gcLocal },
        visitante: { pts: ptsVis,   pj: pjVis,   pg: pgVis,   pe: peVis,   pp: ppVis,   gf: gfVis,   gc: gcVis },
        general:   {
          pts: ptsTotal,
          pj: pjTotal,
          pg: pgLocal + pgVis,
          pe: peLocal + peVis,
          pp: ppLocal + ppVis,
          gf: gfLocal + gfVis,
          gc: gcLocal + gcVis,
          pctPuntos: pjTotal > 0 ? ((ptsTotal / (pjTotal * 3)) * 100).toFixed(1) : '0.0'
        }
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

torneoRoutes.post('/', authMiddleware, async (req, res) => {
  try {
    const torneo = await prisma.torneo.create({ data: req.body })
    res.status(201).json(torneo)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

torneoRoutes.put('/:id', authMiddleware, async (req, res) => {
  try {
    const torneo = await prisma.torneo.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(torneo)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── categorias.js ─────────────────────────────────────────────────────
export const categoriaRoutes = Router()

categoriaRoutes.get('/', authMiddleware, async (req, res) => {
  try {
    const categorias = await prisma.tipoCategoria.findMany({
      orderBy: { nombre: 'asc' }
    })
    res.json(categorias)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

categoriaRoutes.post('/', authMiddleware, async (req, res) => {
  try {
    const cat = await prisma.tipoCategoria.create({ data: req.body })
    res.status(201).json(cat)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
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
  try {
    await prisma.cuota.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Cuota eliminada' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── asistencias.js ────────────────────────────────────────────────────
export const asistenciaRoutes = Router()

asistenciaRoutes.get('/', authMiddleware, async (req, res) => {
  try {
    const { desde, hasta } = req.query
    const where = {}
    if (desde) where.fecha = { gte: new Date(desde) }
    if (hasta) where.fecha = { ...where.fecha, lte: new Date(hasta) }

    const asistencias = await prisma.asistencia.findMany({
      where, orderBy: { fecha: 'desc' },
      include: { personas: { include: { persona: { select: { id: true, apellido: true, nombre: true } } } } }
    })
    res.json(asistencias)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

asistenciaRoutes.post('/', authMiddleware, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── estadisticas.js ───────────────────────────────────────────────────
export const estadisticaRoutes = Router()

estadisticaRoutes.get('/resumen', authMiddleware, async (req, res) => {
  try {
    const [jugadores, torneos, partidos, golesData] = await Promise.all([
      prisma.persona.count({ where: { estado: true } }),
      prisma.torneo.count(),
      prisma.partido.count({ where: { cerrado: true } }),
      prisma.plantelPartido.aggregate({ _sum: { goles: true } })
    ])
    res.json({
      jugadores, torneos, partidos,
      goles: golesData._sum.goles || 0
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

estadisticaRoutes.get('/goleadores', authMiddleware, async (req, res) => {
  try {
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
          select: { id: true, nombre: true, apellido: true, alias: true, foto: true }
        })
        return { ...p, goles: g._sum.goles }
      })
    )
    res.json(conNombres)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

estadisticaRoutes.get('/jugador/:id', authMiddleware, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
