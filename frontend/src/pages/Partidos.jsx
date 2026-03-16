import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Eye, ChevronLeft, ChevronRight, Trophy, Lock } from 'lucide-react'
import { partidoService, torneoService } from '../services/api'

function formatFecha(f) {
  if (!f) return '—'
  try {
    const parte = f.includes('T') ? f.split('T')[0] : f
    const [a, m, d] = parte.split('-').map(Number)
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${d} ${meses[m-1]} ${a}`
  } catch { return '—' }
}

export default function Partidos() {
  const navigate = useNavigate()
  const [torneoId, setTorneoId] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const { data: torneos } = useQuery({
    queryKey: ['torneos'],
    queryFn: () => torneoService.getAll().then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['partidos', torneoId, page],
    queryFn: () => partidoService.getAll({
      torneoId: torneoId || undefined,
      page, limit
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const partidos  = data?.data  || []
  const total     = data?.total || 0
  const totalPag  = Math.ceil(total / limit)

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide flex items-center gap-3">
            <span className="w-10 h-10 bg-atsc-rojo rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </span>
            Partidos
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-1 ml-[52px]">
            Historial y planillas de partidos
          </p>
        </div>
        <button onClick={() => navigate('/partidos/nuevo')} className="btn-primary">
          <Plus size={16} />
          Nuevo Partido
        </button>
      </div>

      {/* Filtro torneo */}
      <div className="card mb-5">
        <div className="p-4 flex items-center gap-4">
          <Trophy size={15} className="text-atsc-gris-texto" />
          <label className="label mb-0">Torneo:</label>
          <select
            value={torneoId}
            onChange={e => { setTorneoId(e.target.value); setPage(1) }}
            className="input w-72"
          >
            <option value="">— Todos los torneos —</option>
            {torneos?.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          <span className="ml-auto text-sm text-atsc-gris-texto">
            {total} partido{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
          </div>
        ) : partidos.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={40} className="text-atsc-gris-claro mx-auto mb-3" />
            <p className="text-atsc-gris-texto font-medium">No hay partidos cargados</p>
            <p className="text-sm text-atsc-gris-texto mt-1">
              Creá el primer partido con el botón de arriba
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-atsc-gris-claro">
                <th className="table-header">Fecha</th>
                <th className="table-header">Torneo</th>
                <th className="table-header text-center">Fecha N°</th>
                <th className="table-header">Local</th>
                <th className="table-header text-center">Resultado</th>
                <th className="table-header">Visitante</th>
                <th className="table-header text-center">Estado</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {partidos.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell text-sm">{formatFecha(p.fecha)}</td>
                  <td className="table-cell text-sm text-atsc-gris-texto">
                    {p.torneo?.nombre || '—'}
                  </td>
                  <td className="table-cell text-center text-sm">
                    {p.fechaNro ? `F${p.fechaNro}` : '—'}
                  </td>
                  <td className="table-cell font-semibold text-sm">
                    {p.equipoLocal?.nombre || '—'}
                  </td>
                  <td className="table-cell text-center">
                    <span className="font-condensed font-black text-lg text-atsc-azul-oscuro">
                      {p.golesLocal} - {p.golesVisitante}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-sm">
                    {p.equipoVisitante?.nombre || '—'}
                  </td>
                  <td className="table-cell text-center">
                    {p.cerrado
                      ? <span className="badge-gris flex items-center gap-1 justify-center"><Lock size={10} />Cerrado</span>
                      : <span className="badge-verde">Abierto</span>
                    }
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => navigate(`/partidos/${p.id}`)}
                      className="btn-ghost px-2 py-1.5 text-xs"
                      title="Ver planilla"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPag > 1 && (
          <div className="px-4 py-3 border-t border-atsc-gris-claro flex items-center justify-between">
            <span className="text-sm text-atsc-gris-texto">Página {page} de {totalPag}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="btn-ghost px-2 py-1 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPag, p+1))} disabled={page===totalPag}
                className="btn-ghost px-2 py-1 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
