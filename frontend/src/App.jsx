import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

// Páginas
import Home       from './pages/Home'
import Dashboard  from './pages/Dashboard'
import Jugadores    from './pages/Jugadores'
import JugadorForm  from './pages/JugadorForm'
import JugadorFicha from './pages/JugadorFicha'
import Partidos     from './pages/Partidos'
import PartidoForm  from './pages/PartidoForm'
import PartidoFicha from './pages/PartidoFicha'

// Rutas protegidas (requieren login)
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Pública */}
        <Route path="/"        element={<Home />} />

        {/* Privadas */}
        <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/jugadores"              element={<PrivateRoute><Jugadores /></PrivateRoute>} />
        <Route path="/jugadores/nuevo"        element={<PrivateRoute><JugadorForm /></PrivateRoute>} />
        <Route path="/jugadores/:id"          element={<PrivateRoute><JugadorFicha /></PrivateRoute>} />
        <Route path="/jugadores/:id/editar"   element={<PrivateRoute><JugadorForm /></PrivateRoute>} />
        <Route path="/partidos"     element={<PrivateRoute><div className="p-8 text-atsc-gris-texto">Módulo Partidos — próximamente</div></PrivateRoute>} />
        <Route path="/torneos"      element={<PrivateRoute><div className="p-8 text-atsc-gris-texto">Módulo Torneos — próximamente</div></PrivateRoute>} />
        <Route path="/estadisticas" element={<PrivateRoute><div className="p-8 text-atsc-gris-texto">Módulo Estadísticas — próximamente</div></PrivateRoute>} />
        <Route path="/cuotas"       element={<PrivateRoute><div className="p-8 text-atsc-gris-texto">Módulo Cuotas — próximamente</div></PrivateRoute>} />
        <Route path="/asistencia"   element={<PrivateRoute><div className="p-8 text-atsc-gris-texto">Módulo Asistencia — próximamente</div></PrivateRoute>} />
        <Route path="/partidos"         element={<PrivateRoute><Partidos /></PrivateRoute>} />
        <Route path="/partidos/nuevo"   element={<PrivateRoute><PartidoForm /></PrivateRoute>} />
        <Route path="/partidos/:id"     element={<PrivateRoute><PartidoFicha /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
