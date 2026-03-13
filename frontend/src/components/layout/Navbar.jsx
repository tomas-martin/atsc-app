import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { label: 'Inicio',    path: '/' },
  { label: 'Clubes',    path: '/clubes' },
  { label: 'Torneos',   path: '/torneos' },
  { label: 'FEFUSA',    path: '/fefusa' },
]

const MENU_LOGUEADO = [
  { label: 'Dashboard',    path: '/dashboard' },
  { label: 'Jugadores',    path: '/jugadores' },
  { label: 'Partidos',     path: '/partidos' },
  { label: 'Torneos',      path: '/torneos' },
  { label: 'Estadísticas', path: '/estadisticas' },
  { label: 'Cuotas',       path: '/cuotas' },
  { label: 'Asistencia',   path: '/asistencia' },
]

export default function Navbar() {
  const { user, login } = useAuth()
  const navigate        = useNavigate()
  const location        = useLocation()
  const [usuario, setUsuario]   = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!usuario || !password) return
    setLoading(true)
    try {
      await login(usuario, password)
      toast.success('Bienvenido al sistema ATSC')
      navigate('/dashboard')
    } catch {
      toast.error('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const links = user ? MENU_LOGUEADO : NAV_LINKS

  return (
    <nav className="bg-atsc-rojo shadow-lg shadow-atsc-rojo/30">
      <div className="flex items-center justify-between px-8">

        {/* Links de navegación */}
        <div className="flex">
          {links.map(({ label, path }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  relative px-5 h-[46px] font-condensed text-[15px] font-bold tracking-widest uppercase
                  transition-all duration-200
                  ${active
                    ? 'text-white bg-black/20 after:scale-x-100'
                    : 'text-white/80 hover:text-white hover:bg-black/10 after:scale-x-0'
                  }
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0
                  after:h-[3px] after:bg-white after:transition-transform after:duration-200
                `}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Login (solo si no está logueado) */}
        {!user && (
          <form onSubmit={handleLogin} className="flex items-center gap-2.5">
            <span className="font-condensed text-xs font-bold tracking-widest uppercase text-white/75">
              Usuario:
            </span>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="Usuario"
              className="h-8 w-28 px-3 bg-white/12 border border-white/25 rounded-md text-white text-sm placeholder:text-white/40 outline-none focus:border-white/70 focus:bg-white/18 transition-all"
            />
            <span className="font-condensed text-xs font-bold tracking-widest uppercase text-white/75">
              Contraseña:
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className="h-8 w-28 px-3 bg-white/12 border border-white/25 rounded-md text-white text-sm placeholder:text-white/40 outline-none focus:border-white/70 focus:bg-white/18 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-8 w-8 bg-atsc-azul-oscuro rounded-lg flex items-center justify-center text-white hover:bg-atsc-azul-medio transition-all disabled:opacity-60"
            >
              {loading ? '...' : '→'}
            </button>
          </form>
        )}
      </div>
    </nav>
  )
}
