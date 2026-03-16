import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Plus, Filter, ChevronLeft, ChevronRight, Eye, Pencil, UserX } from 'lucide-react'
import { personaService } from '../services/api'
import toast from 'react-hot-toast'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

function calcularEdad(fechaNac) {
  if (!fechaNac) return null
  const hoy = new Date()
  const nac = new Date(fechaNac)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export default function Jugadores() {
  const navigate = useNavigate()
  const [buscar, setBuscar]   = useState('')
  const [estado, setEstado]   = useState('true')
  const [page, setPage]       = useState(1)
  const limit = 20

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['personas', buscar, estado, page],
    queryFn: () => personaService.getAll({ buscar: buscar || undefined, estado, page, limit }).then(r => r.data),
    keepPreviousData: true,
  })

  const personas = data?.data || []
  const total    = data?.total || 0
  const totalPag = Math.ceil(total / limit)

  const handleBuscar = (e) => {
    setBuscar(e.target.value)
    setPage(1)
  }

  const handleDesactivar = async (id, nombre) => {
    if (!confirm(`¿Desactivar a ${nombre}?`)) return
    try {
      await personaService.delete(id)
      toast.success('Jugador desactivado')
      refetch()
    } catch {
      toast.error('Error al desactivar')
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide flex items-center gap-3">
            <span className="w-10 h-10 bg-atsc-azul-claro rounded-xl flex items-center justify-center">
              <Users size={20} className="text-white" />
            </span>
            Jugadores
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-1 ml-[52px]">
            Gestión de personas y socios del club
          </p>
        </div>
        <button
          onClick={() => navigate('/jugadores/nuevo')}
          className="btn-primary"
        >
          <Plus size={16} />
          Nuevo Jugador
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-5">
        <div className="p-4 flex items-center gap-4">

          {/* Búsqueda */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-atsc-gris-texto" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, alias o DNI..."
              value={buscar}
              onChange={handleBuscar}
              className="input pl-9"
            />
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-atsc-gris-texto" />
            <label className="label mb-0">Estado:</label>
            <select
              value={estado}
              onChange={e => { setEstado(e.target.value); setPage(1) }}
              className="input w-auto"
            >
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
              <option value="">Todos</option>
            </select>
          </div>

          {/* Total */}
          <span className="ml-auto text-sm text-atsc-gris-texto">
            {total} resultado{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
          </div>
        ) : personas.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-atsc-gris-claro mx-auto mb-3" />
            <p className="text-atsc-gris-texto font-medium">No se encontraron jugadores</p>
            <p className="text-sm text-atsc-gris-texto mt-1">
              {buscar ? 'Probá con otra búsqueda' : 'Agregá el primer jugador con el botón de arriba'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-atsc-gris-claro">
                <th className="table-header w-10">#</th>
                <th className="table-header">Jugador</th>
                <th className="table-header">DNI</th>
                <th className="table-header">Edad</th>
                <th className="table-header">Teléfono</th>
                <th className="table-header">Tipo</th>
                <th className="table-header">Estado</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => {
                const edad = calcularEdad(p.fechaNac)
                const nombre = `${p.apellido}, ${p.nombre}`
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell text-atsc-gris-texto text-xs">{p.id}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-atsc-azul-claro to-atsc-azul-oscuro flex items-center justify-center text-white font-condensed font-bold text-sm flex-shrink-0">
                          {p.apellido[0]}{p.nombre[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-atsc-azul-oscuro text-sm">{nombre}</div>
                          {p.alias && <div className="text-xs text-atsc-gris-texto">"{p.alias}"</div>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm">{p.documento || '—'}</td>
                    <td className="table-cell text-sm">
                      {edad !== null ? `${edad} años` : '—'}
                    </td>
                    <td className="table-cell text-sm">{p.telefono || '—'}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.tiposPersona?.map(tp => (
                          <span key={tp.tipoId} className="badge-azul text-[11px]">
                            {tp.tipo?.nombre}
                          </span>
                        ))}
                        {(!p.tiposPersona || p.tiposPersona.length === 0) && (
                          <span className="badge-gris text-[11px]">Sin tipo</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={p.estado ? 'badge-verde' : 'badge-gris'}>
                        {p.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/jugadores/${p.id}`)}
                          className="btn-ghost px-2 py-1.5 text-xs"
                          title="Ver ficha"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/jugadores/${p.id}/editar`)}
                          className="btn-ghost px-2 py-1.5 text-xs"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        {p.estado && (
                          <button
                            onClick={() => handleDesactivar(p.id, nombre)}
                            className="btn-ghost px-2 py-1.5 text-xs text-atsc-rojo hover:bg-red-50"
                            title="Desactivar"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        {totalPag > 1 && (
          <div className="px-4 py-3 border-t border-atsc-gris-claro flex items-center justify-between">
            <span className="text-sm text-atsc-gris-texto">
              Página {page} de {totalPag}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost px-2 py-1 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPag, p + 1))}
                disabled={page === totalPag}
                className="btn-ghost px-2 py-1 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
