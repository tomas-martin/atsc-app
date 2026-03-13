import { Router }       from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/personas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { buscar, estado, tipo, page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const where = {}
    if (estado !== undefined) where.estado = estado === 'true'
    if (buscar) {
      where.OR = [
        { apellido: { contains: buscar, mode: 'insensitive' } },
        { nombre:   { contains: buscar, mode: 'insensitive' } },
        { alias:    { contains: buscar, mode: 'insensitive' } },
        { documento:{ contains: buscar, mode: 'insensitive' } },
      ]
    }

    const [total, personas] = await Promise.all([
      prisma.persona.count({ where }),
      prisma.persona.findMany({
        where, skip, take: Number(limit),
        orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
        include: { tiposPersona: { include: { tipo: true } } }
      })
    ])

    res.json({ data: personas, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/personas/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        tiposPersona: { include: { tipo: true } },
        cuotas:       { orderBy: [{ anio: 'desc' }, { mes: 'desc' }] },
        pases:        { orderBy: { fecha: 'desc' } },
      }
    })
    if (!persona) return res.status(404).json({ message: 'Persona no encontrada' })
    res.json(persona)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/personas
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tiposPersona, ...data } = req.body
    const persona = await prisma.persona.create({
      data: {
        ...data,
        fechaNac: data.fechaNac ? new Date(data.fechaNac) : null,
        tiposPersona: tiposPersona?.length
          ? { create: tiposPersona.map(tipoId => ({ tipoId })) }
          : undefined
      }
    })
    res.status(201).json(persona)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/personas/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { tiposPersona, ...data } = req.body
    const id = Number(req.params.id)

    const persona = await prisma.persona.update({
      where: { id },
      data: {
        ...data,
        fechaNac: data.fechaNac ? new Date(data.fechaNac) : null,
      }
    })
    res.json(persona)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/personas/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.persona.update({
      where: { id: Number(req.params.id) },
      data: { estado: false }
    })
    res.json({ message: 'Persona desactivada correctamente' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/personas/:id/cuotas
router.get('/:id/cuotas', authMiddleware, async (req, res) => {
  const cuotas = await prisma.cuota.findMany({
    where: { personaId: Number(req.params.id) },
    orderBy: [{ anio: 'desc' }, { mes: 'desc' }]
  })
  res.json(cuotas)
})

export default router
