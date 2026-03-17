import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Eye, ChevronLeft, ChevronRight, Lock,
         ChevronUp, ChevronDown, ChevronsUpDown, Filter, X } from 'lucide-react'
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

function SortIcon({ campo, sortBy, sortDir }) {
  if (sortBy !== campo) return <ChevronsUpDown size={13} className="text-atsc-gris-claro" />
  return sortDir === 'asc' ? <ChevronUp size={13} className="text-atsc-azul-claro" /> : <ChevronDown size={13} className="text-atsc-azul-claro" />
}

function Th({ campo, label, sortBy, sortDir, onSort, className = '' }) {
  return (
    <th onClick={() => onSort(campo)}
      className={`table-header cursor-pointer select-none hover:text-atsc-azul-oscuro ${sortBy===campo?'text-atsc-azul-claro':''} ${className}`}>
      <div className="flex items-center gap-1">{label}<SortIcon campo={campo} sortBy={sortBy} sortDir={sortDir} /></div>
    </th>
  )
}

export default function Partidos() {
  const navigate = useNavigate()
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTorneo, setFiltroTorneo]       = useState('')
  const [filtroCerrado, setFiltroCerrado]     = useState('')
  const [sortBy, setSortBy]   = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage]       = useState(1)
  const limit = 50

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

  useEffect(() => { setFiltroTorneo(''); setPage(1) }, [filtroCategoria])

  const { data, isLoading } = useQuery({
    queryKey: ['partidos', filtroTorneo, filtroCerrado],
    queryFn: () => partidoService.getAll({
      torneoId: filtroTorneo  || undefined,
      cerrado:  filtroCerrado !== '' ? filtroCerrado : undefined,
      page: 1, limit: 500,
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const todosPartidos = useMemo(() => {
    let lista = data?.data || []
    if (filtroCategoria && !filtroTorneo) {
      const ids = new Set(torneosDisponibles.map(t => t.id))
      lista = lista.filter(p => ids.has(p.torneoId))
    }
    return lista
  }, [data, filtroCategoria, filtroTorneo, torneosDisponibles])

  const partidos = useMemo(() => {
    const sorted = [...todosPartidos].sort((a, b) => {
      let valA, valB
      switch (sortBy) {
        case 'fecha':          valA = a.fecha||''; valB = b.fecha||''; break
        case 'fechaNro':       valA = Number(a.fechaNro)||0; valB = Number(b.fechaNro)||0; break
        case 'torneo':         valA = (a.torneo?.nombre||'').toLowerCase(); valB = (b.torneo?.nombre||'').toLowerCase(); break
        case 'local':          valA = (a.equipoLocal?.nombre||'').toLowerCase(); valB = (b.equipoLocal?.nombre||'').toLowerCase(); break
        case 'visitante':      valA = (a.equipoVisitante?.nombre||'').toLowerCase(); valB = (b.equipoVisitante?.nombre||'').toLowerCase(); break
        case 'golesLocal':     valA = Number(a.golesLocal)||0; valB = Number(b.golesLocal)||0; break
        case 'golesVisitante': valA = Number(a.golesVisitante)||0; valB = Number(b.golesVisitante)||0; break
        case 'totalGoles':     valA = (Number(a.golesLocal)||0)+(Number(a.golesVisitante)||0); valB = (Number(b.golesLocal)||0)+(Number(b.golesVisitante)||0); break
        case 'estado':         valA = a.cerrado?1:0; valB = b.cerrado?1:0; break
        default: valA = a.fecha||''; valB = b.fecha||''
      }
      if (valA < valB) return sortDir==='asc'?-1:1
      if (valA > valB) return sortDir==='asc'?1:-1
      return 0
    })
    return sorted.slice((page-1)*limit, page*limit)
  }, [todosPartidos, sortBy, sortDir, page])

  const total    = todosPartidos.length
  const totalPag = Math.ceil(total / limit)

  const handleSort = (campo) => {
    if (sortBy===campo) setSortDir(d=>d==='asc'?'desc':'asc')
    else { setSortBy(campo); setSortDir(campo==='fecha'?'desc':'asc') }
    setPage(1)
  }

  const limpiar = () => { setFiltroCategoria(''); setFiltroTorneo(''); setFiltroCerrado(''); setPage(1) }
  const hayFiltros = filtroCategoria || filtroTorneo || filtroCerrado !== ''

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-7">

      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide flex items-center gap-3">
            <span className="w-10 h-10 bg-atsc-rojo rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </span>
            Partidos
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-1 ml-[52px]">{total} partido{total!==1?'s':''}</p>
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
              <select value={filtroCategoria} onChange={e=>setFiltroCategoria(e.target.value)} className="input w-40">
                <option value="">Todas</option>
                {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="flex-1 max-w-sm">
              <label className="label">Torneo</label>
              <select value={filtroTorneo} onChange={e=>{setFiltroTorneo(e.target.value);setPage(1)}} className="input">
                <option value="">— Todos —</option>
                {torneosDisponibles.map(t=><option key={t.id} value={t.id}>{t.nombre} {t.fecha}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <div className="flex rounded-lg overflow-hidden border-2 border-atsc-gris-claro">
                {[['','Todos'],['false','En curso'],['true','Cerrados']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>{setFiltroCerrado(val);setPage(1)}}
                    className={`px-3 py-2 text-xs font-semibold transition-all ${filtroCerrado===val?'bg-atsc-azul-oscuro text-white':'bg-white text-atsc-gris-texto hover:bg-atsc-fondo'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {hayFiltros && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {filtroCategoria && <span className="badge-azul flex items-center gap-1">{categorias.find(c=>String(c.id)===String(filtroCategoria))?.nombre}<button onClick={()=>setFiltroCategoria('')}><X size={10}/></button></span>}
              {filtroTorneo && <span className="badge-azul flex items-center gap-1">{torneosDisponibles.find(t=>String(t.id)===String(filtroTorneo))?.nombre}<button onClick={()=>setFiltroTorneo('')}><X size={10}/></button></span>}
              {filtroCerrado!=='' && <span className="badge-azul flex items-center gap-1">{filtroCerrado==='true'?'Cerrados':'En curso'}<button onClick={()=>setFiltroCerrado('')}><X size={10}/></button></span>}
            </div>
          )}
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
            <p className="text-atsc-gris-texto font-medium">No hay partidos con esos filtros</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-atsc-gris-claro">
                <Th campo="fecha"          label="Fecha"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th campo="torneo"         label="Torneo"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th campo="fechaNro"       label="F°"        sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <Th campo="local"          label="Local"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th campo="golesLocal"     label="GL"        sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="table-header text-center">-</th>
                <Th campo="golesVisitante" label="GV"        sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <Th campo="visitante"      label="Visitante" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th campo="totalGoles"     label="Total"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <Th campo="estado"         label="Estado"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="text-center" />
                <th className="table-header text-right">Ver</th>
              </tr>
            </thead>
            <tbody>
              {partidos.map(p => {
                const esATSC_local = p.equipoLocal?.nombre?.toUpperCase().includes('TALLERES')
                const esATSC_vis   = p.equipoVisitante?.nombre?.toUpperCase().includes('TALLERES')
                return (
                  <tr key={p.id} className={`table-row ${(esATSC_local||esATSC_vis)?'bg-blue-50/30':''}`}>
                    <td className="table-cell text-sm">{formatFecha(p.fecha)}</td>
                    <td className="table-cell text-sm text-atsc-gris-texto max-w-[150px] truncate">{p.torneo?.nombre||'—'}</td>
                    <td className="table-cell text-center">{p.fechaNro?<span className="badge-azul">F{p.fechaNro}</span>:'—'}</td>
                    <td className={`table-cell text-sm font-semibold ${esATSC_local?'text-atsc-azul-claro':''}`}>{p.equipoLocal?.nombre||'—'}</td>
                    <td className="table-cell text-center font-condensed font-black text-lg">{p.golesLocal}</td>
                    <td className="table-cell text-center text-atsc-gris-texto font-bold">-</td>
                    <td className="table-cell text-center font-condensed font-black text-lg">{p.golesVisitante}</td>
                    <td className={`table-cell text-sm font-semibold ${esATSC_vis?'text-atsc-azul-claro':''}`}>{p.equipoVisitante?.nombre||'—'}</td>
                    <td className="table-cell text-center text-sm text-atsc-gris-texto">{(Number(p.golesLocal)||0)+(Number(p.golesVisitante)||0)}</td>
                    <td className="table-cell text-center">
                      {p.cerrado
                        ?<span className="badge-gris flex items-center gap-1 justify-center"><Lock size={10}/>Cerrado</span>
                        :<span className="badge-verde">En curso</span>}
                    </td>
                    <td className="table-cell text-right">
                      <button onClick={()=>navigate(`/partidos/${p.id}`)} className="btn-ghost px-2 py-1.5 text-xs"><Eye size={14}/></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {totalPag > 1 && (
          <div className="px-4 py-3 border-t border-atsc-gris-claro flex items-center justify-between">
            <span className="text-sm text-atsc-gris-texto">Mostrando {(page-1)*limit+1}–{Math.min(page*limit,total)} de {total}</span>
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost px-2 py-1 disabled:opacity-40"><ChevronLeft size={16}/></button>
              <button onClick={()=>setPage(p=>Math.min(totalPag,p+1))} disabled={page===totalPag} className="btn-ghost px-2 py-1 disabled:opacity-40"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
