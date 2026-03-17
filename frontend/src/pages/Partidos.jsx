import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Eye, ChevronLeft, ChevronRight, Lock, Filter, X } from 'lucide-react'
import { partidoService, torneoService, categoriaService } from '../services/api'

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
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTorneo, setFiltroTorneo]       = useState('')
  const [filtroCerrado, setFiltroCerrado]     = useState('')
  const [fechaIdx, setFechaIdx]               = useState(0)

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriaService.getAll().then(r => r.data),
  })

  const { data: todosLosTorneos = [] } = useQuery({
    queryKey: ['torneos-todos'],
    queryFn: () => torneoService.getAll().then(r => r.data),
  })

  const torneosDisponibles = useMemo(() => {
    if (!filtroCategoria) return todosLosTorneos
    return todosLosTorneos.filter(t => String(t.categoriaId) === String(filtroCategoria))
  }, [todosLosTorneos, filtroCategoria])

  useEffect(() => { setFiltroTorneo(''); setFechaIdx(0) }, [filtroCategoria])
  useEffect(() => { setFechaIdx(0) }, [filtroTorneo, filtroCerrado])

  const { data, isLoading } = useQuery({
    queryKey: ['partidos', filtroTorneo, filtroCerrado],
    queryFn: () => partidoService.getAll({
      torneoId: filtroTorneo  || undefined,
      cerrado:  filtroCerrado !== '' ? filtroCerrado : undefined,
      page: 1, limit: 1000,
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const fechas = useMemo(() => {
    let lista = data?.data || []

    if (filtroCategoria && !filtroTorneo) {
      const ids = new Set(torneosDisponibles.map(t => t.id))
      lista = lista.filter(p => ids.has(p.torneoId))
    }

    // Agrupar por fecha + torneo + fechaNro
    const grupos = {}
    for (const p of lista) {
      const fechaStr = p.fecha ? p.fecha.split('T')[0] : '0000'
      const key = `${fechaStr}__${p.torneoId}__${p.fechaNro || 0}`
      if (!grupos[key]) {
        grupos[key] = { key, fecha: fechaStr, fechaNro: p.fechaNro, torneo: p.torneo, partidos: [] }
      }
      grupos[key].partidos.push(p)
    }

    // Ordenar fechas desc
    return Object.values(grupos).sort((a, b) => {
  if (a.fecha < b.fecha) return -1
  if (a.fecha > b.fecha) return 1
  return (Number(a.fechaNro)||0) - (Number(b.fechaNro)||0)
    })
  }, [data, filtroCategoria, filtroTorneo, torneosDisponibles])

  const fechaActual = fechas[fechaIdx]
  const totalFechas = fechas.length
  const limpiar = () => { setFiltroCategoria(''); setFiltroTorneo(''); setFiltroCerrado(''); setFechaIdx(0) }
  const hayFiltros = filtroCategoria || filtroTorneo || filtroCerrado !== ''

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">

      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide flex items-center gap-3">
            <span className="w-10 h-10 bg-atsc-rojo rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </span>
            Partidos
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-1 ml-[52px]">
            {totalFechas} fecha{totalFechas !== 1 ? 's' : ''}
            {fechaActual && ` · ${fechaActual.partidos.length} partido${fechaActual.partidos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => navigate('/partidos/nuevo')} className="btn-primary">
          <Plus size={16} />Nuevo Partido
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-5">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={13} className="text-atsc-gris-texto" />
            <span className="text-xs font-bold uppercase tracking-wide text-atsc-gris-texto">Filtros</span>
            {hayFiltros && (
              <button onClick={limpiar} className="ml-auto btn-ghost text-xs px-2 py-1 flex items-center gap-1">
                <X size={12} />Limpiar
              </button>
            )}
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="label">Categoría</label>
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="input w-40">
                <option value="">Todas</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="flex-1 max-w-sm">
              <label className="label">Torneo</label>
              <select value={filtroTorneo} onChange={e => setFiltroTorneo(e.target.value)} className="input">
                <option value="">— Todos —</option>
                {torneosDisponibles.map(t => <option key={t.id} value={t.id}>{t.nombre} {t.fecha}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <div className="flex rounded-lg overflow-hidden border-2 border-atsc-gris-claro">
                {[['','Todos'],['false','En curso'],['true','Cerrados']].map(([val,lbl]) => (
                  <button key={val} onClick={() => setFiltroCerrado(val)}
                    className={`px-3 py-2 text-xs font-semibold transition-all ${filtroCerrado===val?'bg-atsc-azul-oscuro text-white':'bg-white text-atsc-gris-texto hover:bg-atsc-fondo'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
        </div>
      ) : fechas.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar size={40} className="text-atsc-gris-claro mx-auto mb-3" />
          <p className="text-atsc-gris-texto font-medium">No hay partidos con esos filtros</p>
        </div>
      ) : (
        <>
          {/* Navegador */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setFechaIdx(i => Math.max(0, i-1))}
              disabled={fechaIdx === 0}
              className="btn-outline disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <div className="text-center">
              <div className="font-condensed text-xl font-black text-atsc-azul-oscuro">
                {fechaActual?.torneo?.nombre}
                {fechaActual?.fechaNro ? ` — Fecha ${fechaActual.fechaNro}` : ''}
              </div>
              <div className="text-sm text-atsc-gris-texto mt-0.5">
                {formatFecha(fechaActual?.fecha)} · {fechaIdx + 1} / {totalFechas}
              </div>
            </div>

            <button
              onClick={() => setFechaIdx(i => Math.min(totalFechas-1, i+1))}
              disabled={fechaIdx === totalFechas-1}
              className="btn-outline disabled:opacity-40 flex items-center gap-1"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>

          {/* Tabla de partidos */}
          <div className="card">
            <div className="card-header">
              <span className="card-title flex items-center gap-2">
                <Calendar size={14} />
                {fechaActual?.torneo?.nombre}
                {fechaActual?.fechaNro ? ` · Fecha ${fechaActual.fechaNro}` : ''}
              </span>
              <span className="badge-gris">{fechaActual?.partidos.length} partidos</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-atsc-gris-claro bg-atsc-azul-oscuro">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Local</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-36">Resultado</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Visitante</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-24">Estado</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {fechaActual?.partidos.map(p => {
                  const esATSC_local = p.equipoLocal?.nombre?.toUpperCase().includes('TALLERES')
                  const esATSC_vis   = p.equipoVisitante?.nombre?.toUpperCase().includes('TALLERES')
                  const rowClass = (esATSC_local || esATSC_vis)
                    ? 'border-b border-atsc-gris-claro bg-blue-50/50'
                    : 'table-row'
                  return (
                    <tr key={p.id} className={rowClass}>
                      <td className={`px-4 py-3 font-semibold text-sm ${esATSC_local ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                        {p.equipoLocal?.nombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.cerrado ? (
                          <span className="font-condensed font-black text-2xl text-atsc-azul-oscuro">
                            {p.golesLocal} - {p.golesVisitante}
                          </span>
                        ) : (
                          <span className="text-atsc-gris-texto font-bold text-lg">vs</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 font-semibold text-sm ${esATSC_vis ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                        {p.equipoVisitante?.nombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.cerrado
                          ? <span className="badge-gris flex items-center gap-1 justify-center text-[10px]"><Lock size={9}/>Cerrado</span>
                          : <span className="badge-verde text-[10px]">Pendiente</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => navigate(`/partidos/${p.id}`)} className="btn-ghost px-2 py-1 text-xs">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
