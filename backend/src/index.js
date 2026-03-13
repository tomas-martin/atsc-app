import express  from 'express'
import cors     from 'cors'
import morgan   from 'morgan'
import dotenv   from 'dotenv'

import authRoutes        from './routes/auth.js'
import personaRoutes     from './routes/personas.js'
import partidoRoutes     from './routes/partidos.js'
import torneoRoutes      from './routes/torneos.js'
import categoriaRoutes   from './routes/categorias.js'
import estadisticaRoutes from './routes/estadisticas.js'
import cuotaRoutes       from './routes/cuotas.js'
import asistenciaRoutes  from './routes/asistencias.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Rutas
app.use('/api/auth',        authRoutes)
app.use('/api/personas',    personaRoutes)
app.use('/api/partidos',    partidoRoutes)
app.use('/api/torneos',     torneoRoutes)
app.use('/api/categorias',  categoriaRoutes)
app.use('/api/estadisticas',estadisticaRoutes)
app.use('/api/cuotas',      cuotaRoutes)
app.use('/api/asistencias', asistenciaRoutes)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', sistema: 'ATSC' }))

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`🚀 ATSC Backend corriendo en http://localhost:${PORT}`)
})
