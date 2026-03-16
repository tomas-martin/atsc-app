import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Eye, ChevronLeft, ChevronRight, Trophy, Lock, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
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

function SortIcon({ campo, sortBy, sortDir }) {
  if (sortBy !== campo) return <ChevronsUpDown size={13} className="text-atsc-gris-claro" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-atsc-azul-claro" />
    : <ChevronDown size={13} className="text-atsc-azul-claro" />
}

function ThSortable({ campo, label, sortBy, sortDir, onSort, className = '' }) {
  const activo = sortBy === campo
  return (
    <th
      className={`table-header cursor-pointer select-none hover:text-atsc-azul-oscuro transition-colors ${activo ? 'text-atsc-azul-claro' : ''} ${className}`}
      onClick={() => onSort(campo)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon campo={campo} sortBy={sortBy} sortDir={sortDir} />
      </div>
    </th>
  )
}

export default function Partidos() {
  const navigate = useNavigate()
  const [torneoId, setTorneoId] = useState('')
  const [page, setPage]         = useState(1)
  const [sortBy, setSortBy]     = useState('fecha')
  const [sortDir, setSortDir]   = useState('desc')
  const limit = 50

  const { data: torneos } = useQuery({
    queryKey: ['torneos'],
    queryFn: () => torneoService.getAll().then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['partidos', torneoId],
    queryFn: () => partidoService.getAll({
      torneoId: torneoId || undefined,
      page: 1,
      limit: 500
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const todosPartidos = data?.data || []

  const partidos = useMemo(() => {
    const sorted = [...todosPartidos].sort((a, b) => {
      let valA, valB

      switch (sortBy) {
        case 'fecha':
          valA = a.fecha || ''
          valB = b.fecha || ''
          break
        case 'fechaNro':
          valA = Number(a.fechaNro) || 0
          valB = Number(b.fechaNro) || 0
          break
        case 'torneo':
          valA = (a.torneo?.nombre || '').toLowerCase()
          valB = (b.torneo?.nombre || '').toLowerCase()
          break
        case 'local':
          valA = (a.equipoLocal?.nombre || '').toLowerCase()
          valB = (b.equipoLocal?.nombre || '').toLowerCase()
          break
        case 'visitante':
          valA = (a.equipoVisitante?.nombre || '').toLowerCase()
          valB = (b.equipoVisitante?.nombre || '').toLowerCase()
          break
        case 'golesLocal':
          valA = Number(a.golesLocal) || 0
          valB = Number(b.golesLocal) || 0
          break
        case 'golesVisitante':
          valA = Number(a.golesVisitante) || 0
          valB = Number(b.golesVisitante) || 0
          break
        case 'totalGoles':
          valA = (Number(a.golesLocal) || 0) + (Number(a.golesVisitante) || 0)
          valB = (Number(b.golesLocal) || 0) + (Number(b.golesVisitante) || 0)
          break
        case 'estado':
          valA = a.cerrado ? 1 : 0
          valB = b.cerrado ? 1 : 0
          break
        default:
          valA = a.fecha || ''
          valB = b.fecha || ''
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    const start = (page - 1) * limit
    return sorted.slice(start, start + limit)
  }, [todosPartidos, sortBy, sortDir, page])

  const total    = todosPartidos.length
  const totalPag = Math.ceil(total / limit)

  const handleSort = (campo) => {
    if (sortBy === campo) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(campo)
      setSortDir(campo === 'fecha' ? 'desc' : 'asc')
    }
    setPage(1)
  }

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

      {/* Filtros */}
      <div className="card mb-5">
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <Trophy size={15} className="text-atsc-gris-texto" />
          <label className="label mb-0">Torneo:</label>
          <select value={torneoId} onChange={e => { setTorneoId(e.target.value); setPage(1) }} className="input w-72">
            <option value="">— Todos los torneos —</option>
            {torneos?.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          <span className="ml-auto text-sm text-atsc-gris-texto">
            {total} partido{total !== 1 ? 's' : ''}
            {sortBy && <span className="ml-2 badge-azul">Ordenado por {sortBy} {sortDir === 'asc' ? '↑' : '↓'}</span>}
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
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-atsc-gris-claro">
                <ThSortable campo="fecha"          label="Fecha"      sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ThSortable campo="torneo"         label="Torneo"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ThSortable campo="fechaNro"       label="Fecha N°"   sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <ThSortable campo="local"          label="Local"      sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ThSortable campo="golesLocal"     label="GL"         sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="table-header text-center">-</th>
                <ThSortable campo="golesVisitante" label="GV"         sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <ThSortable campo="visitante"      label="Visitante"  sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ThSortable campo="totalGoles"     label="Total Goles" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <ThSortable campo="estado"         label="Estado"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="table-header text-right">Ver</th>
              </tr>
            </thead>
            <tbody>
              {partidos.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell text-sm">{formatFecha(p.fecha)}</td>
                  <td className="table-cell text-sm text-atsc-gris-texto">{p.torneo?.nombre || '—'}</td>
                  <td className="table-cell text-center text-sm">
                    {p.fechaNro ? <span className="badge-azul">F{p.fechaNro}</span> : '—'}
                  </td>
                  <td className="table-cell font-semibold text-sm">{p.equipoLocal?.nombre || '—'}</td>
                  <td className="table-cell text-center">
                    <span className="font-condensed font-black text-lg text-atsc-azul-oscuro">{p.golesLocal}</span>
                  </td>
                  <td className="table-cell text-center text-atsc-gris-texto font-bold">-</td>
                  <td className="table-cell text-center">
                    <span className="font-condensed font-black text-lg text-atsc-azul-oscuro">{p.golesVisitante}</span>
                  </td>
                  <td className="table-cell font-semibold text-sm">{p.equipoVisitante?.nombre || '—'}</td>
                  <td className="table-cell text-center text-sm text-atsc-gris-texto">
                    {Number(p.golesLocal) + Number(p.golesVisitante)}
                  </td>
                  <td className="table-cell text-center">
                    {p.cerrado
                      ? <span className="badge-gris flex items-center gap-1 justify-center"><Lock size={10} />Cerrado</span>
                      : <span className="badge-verde">Abierto</span>
                    }
                  </td>
                  <td className="table-cell text-right">
                    <button onClick={() => navigate(`/partidos/${p.id}`)}
                      className="btn-ghost px-2 py-1.5 text-xs" title="Ver planilla">
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
            <span className="text-sm text-atsc-gris-texto">
              Mostrando {(page-1)*limit+1}–{Math.min(page*limit, total)} de {total}
            </span>
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
