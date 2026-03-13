import { Router }       from 'express'
import bcrypt           from 'bcryptjs'
import jwt              from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body
    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' })
    }

    const user = await prisma.usuario.findUnique({ where: { usuario } })
    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, tipoId: user.tipoId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    // Registrar log
    await prisma.log.create({ data: { usuarioId: user.id, evento: 'LOGIN' } })

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, usuario: user.usuario, tipoId: user.tipoId }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: { id: true, nombre: true, usuario: true, tipoId: true }
  })
  res.json(user)
})

export default router
