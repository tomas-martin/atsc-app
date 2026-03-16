// ── backend/src/routes/clubes.js ──────────────────────────────────────────
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/clubes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clubes = await prisma.club.findMany({ orderBy: { nombre: 'asc' } })
    res.json(clubes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/clubes
router.post('/', authMiddleware, async (req, res) => {
  try {
    const club = await prisma.club.create({ data: { nombre: req.body.nombre } })
    res.status(201).json(club)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
