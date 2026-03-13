import { useQuery } from '@tanstack/react-query'
import { Users, Trophy, Calendar, Target } from 'lucide-react'
import { estadisticaService } from '../services/api'

function StatCard({ icon: Icon, value, label, color }) {
  const colors = {
    azul:  { bar: 'bg-atsc-azul-claro', icon: 'bg-blue-50 text-atsc-azul-claro' },
    rojo:  { bar: 'bg-atsc-rojo',       icon: 'bg-red-50 text-atsc-rojo' },
    verde: { bar: 'bg-green-500',        icon: 'bg-green-50 text-green-600' },
    dorado:{ bar: 'bg-yellow-500',       icon: 'bg-yellow-50 text-yellow-600' },
  }
  const c = colors[color] || colors.azul
  return (
    <div className="card relative overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.bar}`} />
      <div className="p-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${c.icon}`}>
          <Icon size={20} />
        </div>
        <div className="font-condensed text-[34px] font-black text-atsc-azul-oscuro leading-none mb-1">
          {value ?? '—'}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-atsc-gris-texto">
          {label}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: resumen } = useQuery({
    queryKey: ['resumen'],
    queryFn: () => estadisticaService.resumenClub().then(r => r.data),
  })

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-1">
            Resumen general del club — Temporada {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <StatCard icon={Users}    value={resumen?.jugadores}  label="Jugadores activos" color="azul" />
        <StatCard icon={Target}   value={resumen?.goles}      label="Goles esta temporada" color="rojo" />
        <StatCard icon={Trophy}   value={resumen?.torneos}    label="Torneos activos" color="verde" />
        <StatCard icon={Calendar} value={resumen?.partidos}   label="Partidos jugados" color="dorado" />
      </div>

      {/* Contenido en 2 columnas */}
      <div className="grid grid-cols-2 gap-5">

        {/* Últimos partidos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Últimos Partidos</span>
            <span className="badge-azul">Recientes</span>
          </div>
          <div className="p-4 text-sm text-atsc-gris-texto text-center py-10">
            Cargando partidos...
          </div>
        </div>

        {/* Tabla de posiciones */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tabla de Posiciones</span>
            <span className="badge-rojo">En curso</span>
          </div>
          <div className="p-4 text-sm text-atsc-gris-texto text-center py-10">
            Seleccioná un torneo para ver posiciones
          </div>
        </div>

      </div>
    </div>
  )
}
