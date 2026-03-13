import Header from './Header'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-atsc-azul-oscuro border-t-4 border-atsc-rojo px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl opacity-70">⚽</span>
          <div>
            <p className="text-xs font-semibold text-white/75">A.T.S.C. — Andes Talleres Sporting Club</p>
            <p className="text-xs text-white/40">Copyright 2026. Todos los Derechos Reservados.</p>
          </div>
        </div>
        <p className="text-xs text-white/30 italic">Diseñado por RJMARTIN</p>
      </footer>
    </div>
  )
}
