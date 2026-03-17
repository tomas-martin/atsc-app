import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Trophy, Search, Filter, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { torneoService, categoriaService } from '../services/api'

function SortIcon({ campo, sortBy, sortDir }) {
  if (sortBy !== campo) return <ChevronsUpDown size={12} className="text-atsc-gris-claro" />
  return sortDir === 'asc' ? <ChevronUp size={12} className="text-atsc-azul-claro" /> : <ChevronDown size={12} className="text-atsc-azul-claro" />
}

function Th({ campo, label, sortBy, sortDir, onSort, className = '' }) {
  return (
    <th onClick={() => onSort(campo)}
      className={`table-header cursor-pointer select-none hover:text-atsc-azul-oscuro ${sortBy===campo?'text-atsc-azul-claro':''} ${className}`}>
      <div className="flex items-center gap-1">{label}<SortIcon campo={campo} sortBy={sortBy} sortDir={sortDir} /></div>
    </th>
  )
}

export default function Torneos() {
  const navigate = useNavigate()
  const [filtroAnio, setFiltroAnio]       = useState('')
  const [filtroNombre, setFiltroNombre]   = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [sortBy, setSortBy]   = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')

  const { data: torneos = [], isLoading } = useQuery({
    queryKey: ['torneos', filtroAnio, filtroNombre, filtroCategoria],
    queryFn: () => torneoService.getAll({
      anio:      filtroAnio      || undefined,
      nombre:    filtroNombre    || undefined,
      categoria: filtroCategoria || undefined,
    }).then(r => r.data),
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriaService.getAll().then(r => r.data),
  })

  // Años únicos
  const anios = useMemo(() => {
    const set = new Set(torneos.map(t => t.fecha).filter(Boolean))
    return [...set].sort((a, b) => b - a)
  }, [torneos])

  const sorted = useMemo(() => {
    return [...torneos].sort((a, b) => {
      let valA, valB
      switch (sortBy) {
        case 'fecha':    valA = a.fecha || ''; valB = b.fecha || ''; break
        case 'nombre':   valA = (a.nombre||'').toLowerCase(); valB = (b.nombre||'').toLowerCase(); break
        case 'categoria': valA = (a.categoria?.nombre||'').toLowerCase(); valB = (b.categoria?.nombre||'').toLowerCase(); break
        default: valA = a.fecha||''; valB = b.fecha||''
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [torneos, sortBy, sortDir])

  const handleSort = (campo) => {
    if (sortBy === campo) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(campo); setSortDir('asc') }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide flex items-center gap-3">
            <span className="w-10 h-10 bg-atsc-azul-oscuro rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </span>
            Torneos
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-1 ml-[52px]">
            {sorted.length} torneo{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-5">
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <Filter size={14} className="text-atsc-gris-texto" />

          <div>
            <label className="label mb-1">Año</label>
            <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} className="input w-28">
              <option value="">Todos</option>
              {anios.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="flex-1 max-w-xs">
            <label className="label mb-1">Torneo</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-atsc-gris-texto" />
              <input
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                placeholder="Buscar por nombre..."
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="label mb-1">Categoría</label>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="input w-40">
              <option value="">Todas</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {(filtroAnio || filtroNombre || filtroCategoria) && (
            <button
              onClick={() => { setFiltroAnio(''); setFiltroNombre(''); setFiltroCategoria('') }}
              className="btn-ghost text-xs mt-5"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-atsc-gris-texto">
            <Trophy size={40} className="mx-auto mb-3 text-atsc-gris-claro" />
            <p>No se encontraron torneos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-atsc-gris-claro">
                <Th campo="fecha"     label="Año"       sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="w-20" />
                <Th campo="nombre"    label="Torneo"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th campo="categoria" label="Categoría" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="table-header text-right">Ver</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(t => (
                <tr key={t.id} className="table-row cursor-pointer" onClick={() => navigate(`/torneos/${t.id}`)}>
                  <td className="table-cell">
                    <span className="badge-azul">{t.fecha}</span>
                  </td>
                  <td className="table-cell font-semibold text-atsc-azul-oscuro">{t.nombre}</td>
                  <td className="table-cell">
                    <span className="badge-gris">{t.categoria?.nombre || '—'}</span>
                  </td>
                  <td className="table-cell text-right">
                    <ChevronRight size={16} className="text-atsc-gris-texto ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
