import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-atsc-azul-oscuro border-b-4 border-atsc-rojo relative overflow-hidden">
      {/* Gradiente decorativo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-transparent to-atsc-rojo/10 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between px-8 h-[72px]">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <svg className="w-14 h-14 flex-shrink-0" viewBox="0 0 64 64" fill="none">
            <path d="M32 4 L56 14 L56 36 Q56 52 32 60 Q8 52 8 36 L8 14 Z"
              fill="url(#shieldGrad)" stroke="#C8102E" strokeWidth="2.5"/>
            <rect x="8" y="14" width="48" height="8" fill="#C8102E" opacity="0.85"/>
            <text x="32" y="44" textAnchor="middle"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="900" fontSize="13" fill="white" letterSpacing="1">
              ATSC
            </text>
            <defs>
              <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1A3A7A"/>
                <stop offset="100%" stopColor="#0B1F4F"/>
              </linearGradient>
            </defs>
          </svg>

          <div className="flex flex-col leading-tight">
            <span className="font-condensed text-xs font-bold text-atsc-rojo tracking-[3px] uppercase">
              A.T.S.C.
            </span>
            <span className="font-condensed text-2xl font-black text-white uppercase tracking-wide">
              Andes Talleres
            </span>
            <span className="text-[11px] text-white/50 tracking-wide">
              Sporting Club · Mendoza, Argentina
            </span>
          </div>
        </div>

        {/* Usuario logueado */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full pl-2 pr-4 py-1.5">
              <div className="w-7 h-7 bg-atsc-rojo rounded-full flex items-center justify-center">
                <span className="font-condensed font-bold text-xs text-white">
                  {user.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-white/85">{user.nombre}</span>
            </div>
            <button
              onClick={logout}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:bg-atsc-rojo hover:text-white hover:border-atsc-rojo transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
