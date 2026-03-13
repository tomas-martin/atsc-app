import { Router }       from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/partidos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { torneoId, cerrado, page = 1, limit = 20 } = req.query
    const where = {}
    if (torneoId) where.torneoId  = Number(torneoId)
    if (cerrado !== undefined) where.cerrado = cerrado === 'true'

    const [total, partidos] = await Promise.all([
      prisma.partido.count({ where }),
      prisma.partido.findMany({
        where, skip: (Number(page)-1)*Number(limit), take: Number(limit),
        orderBy: { fecha: 'desc' },
        include: {
          torneo:          { select: { id: true, nombre: true } },
          equipoLocal:     { select: { id: true, nombre: true } },
          equipoVisitante: { select: { id: true, nombre: true } },
          _count:          { select: { plantel: true } }
        }
      })
    ])
    res.json({ data: partidos, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/partidos/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const partido = await prisma.partido.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        torneo:          true,
        equipoLocal:     true,
        equipoVisitante: true,
        plantel: {
          include: { persona: { select: { id: true, nombre: true, apellido: true, alias: true } } },
          orderBy: { nroCamiseta: 'asc' }
        }
      }
    })
    if (!partido) return res.status(404).json({ message: 'Partido no encontrado' })
    res.json(partido)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/partidos
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { plantel, ...data } = req.body
    const partido = await prisma.partido.create({
      data: {
        ...data,
        fecha: new Date(data.fecha),
        plantel: plantel?.length
          ? { create: plantel }
          : undefined
      }
    })
    res.status(201).json(partido)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/partidos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { plantel, ...data } = req.body
    const id = Number(req.params.id)
    const partido = await prisma.partido.update({
      where: { id },
      data: { ...data, fecha: data.fecha ? new Date(data.fecha) : undefined }
    })
    res.json(partido)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/partidos/:id/cerrar
router.post('/:id/cerrar', authMiddleware, async (req, res) => {
  try {
    const partido = await prisma.partido.update({
      where: { id: Number(req.params.id) },
      data:  { cerrado: true }
    })
    res.json(partido)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
