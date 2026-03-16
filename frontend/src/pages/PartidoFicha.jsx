import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Lock, Unlock, Save, Shield } from 'lucide-react'
import { partidoService } from '../services/api'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

const plantelService = {
  update: (id, data) => api.put(`/plantel/${id}`, data),
}

function formatFecha(f) {
  if (!f) return '—'
  try {
    const parte = f.includes('T') ? f.split('T')[0] : f
    const [a, m, d] = parte.split('-').map(Number)
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${d} ${meses[m-1]} ${a}`
  } catch { return '—' }
}

export default function PartidoFicha() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [plantelEdit, setPlantelEdit] = useState([])
  const [dirty, setDirty] = useState(false)

  const { data: partido, isLoading } = useQuery({
    queryKey: ['partido', id],
    queryFn: () => partidoService.getById(id).then(r => r.data),
  })

  useEffect(() => {
    if (partido?.plantel) {
      setPlantelEdit(partido.plantel.map(p => ({ ...p })))
      setDirty(false)
    }
  }, [partido])

  const cerrarMutation = useMutation({
    mutationFn: () => partidoService.cerrar(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['partido', id])
      toast.success('Partido cerrado')
    }
  })

  const guardarMutation = useMutation({
    mutationFn: async () => {
      // Guardar cada jugador del plantel
      await Promise.all(plantelEdit.map(p =>
        api.put(`/partidos/${id}/plantel/${p.id}`, {
          nroCamiseta: p.nroCamiseta ? Number(p.nroCamiseta) : null,
          capitan: p.capitan,
          goles: Number(p.goles),
          amarillas: Number(p.amarillas),
          azules: Number(p.azules),
          faltas: Number(p.faltas),
          suspendido: p.suspendido,
        })
      ))
      // Guardar resultado
      await api.put(`/partidos/${id}`, {
        golesLocal: Number(partido.golesLocal),
        golesVisitante: Number(partido.golesVisitante),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partido', id])
      setDirty(false)
      toast.success('Planilla guardada')
    },
    onError: () => toast.error('Error al guardar')
  })

  const actualizarJugador = (plantelId, campo, valor) => {
    setPlantelEdit(prev => prev.map(p =>
      p.id === plantelId ? { ...p, [campo]: valor } : p
    ))
    setDirty(true)
  }

  const [golesLocal, setGolesLocal] = useState(0)
  const [golesVis, setGolesVis] = useState(0)

  useEffect(() => {
    if (partido) {
      setGolesLocal(partido.golesLocal)
      setGolesVis(partido.golesVisitante)
    }
  }, [partido])

  const guardarTodo = async () => {
    try {
      await Promise.all(plantelEdit.map(p =>
        api.put(`/partidos/${id}/plantel/${p.id}`, {
          nroCamiseta: p.nroCamiseta ? Number(p.nroCamiseta) : null,
          capitan: p.capitan,
          goles: Number(p.goles),
          amarillas: Number(p.amarillas),
          azules: Number(p.azules),
          faltas: Number(p.faltas),
          suspendido: p.suspendido,
        })
      ))
      await api.put(`/partidos/${id}`, {
        golesLocal: Number(golesLocal),
        golesVisitante: Number(golesVis),
      })
      queryClient.invalidateQueries(['partido', id])
      setDirty(false)
      toast.success('Planilla guardada')
    } catch {
      toast.error('Error al guardar')
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
    </div>
  )

  if (!partido) return (
    <div className="max-w-[1200px] mx-auto px-8 py-7 text-center text-atsc-gris-texto">
      Partido no encontrado
    </div>
  )

  const cerrado = partido.cerrado

  // Calcular totales
  const totalGoles    = plantelEdit.reduce((s, p) => s + Number(p.goles),     0)
  const totalAmarillas = plantelEdit.reduce((s, p) => s + Number(p.amarillas), 0)
  const totalAzules   = plantelEdit.reduce((s, p) => s + Number(p.azules),    0)
  const totalFaltas   = plantelEdit.reduce((s, p) => s + Number(p.faltas),    0)

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/partidos')} className="btn-ghost px-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-condensed text-2xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
              {partido.torneo?.nombre}
            </h1>
            {partido.fechaNro && (
              <span className="badge-azul">Fecha {partido.fechaNro}</span>
            )}
            {cerrado
              ? <span className="badge-gris flex items-center gap-1"><Lock size={10} />Cerrado</span>
              : <span className="badge-verde">Abierto</span>
            }
          </div>
          <p className="text-sm text-atsc-gris-texto mt-0.5">{formatFecha(partido.fecha)}</p>
        </div>
        <div className="flex gap-2">
          {!cerrado && dirty && (
            <button onClick={guardarTodo} className="btn-primary">
              <Save size={15} />
              Guardar planilla
            </button>
          )}
          {!cerrado && (
            <button
              onClick={() => {
                if (confirm('¿Cerrar el partido? No podrás editar la planilla.')) {
                  cerrarMutation.mutate()
                }
              }}
              className="btn-danger"
            >
              <Lock size={15} />
              Cerrar partido
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex items-center justify-center gap-8">

            {/* Local */}
            <div className="flex-1 text-right">
              <div className="font-condensed text-2xl font-black text-atsc-azul-oscuro uppercase">
                {partido.equipoLocal?.nombre}
              </div>
              <div className="text-xs text-atsc-gris-texto mt-1">Local</div>
            </div>

            {/* Marcador */}
            <div className="flex items-center gap-3">
              {cerrado ? (
                <div className="font-condensed text-5xl font-black text-atsc-azul-oscuro">
                  {partido.golesLocal} - {partido.golesVisitante}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number" value={golesLocal} min="0"
                    onChange={e => { setGolesLocal(e.target.value); setDirty(true) }}
                    className="w-16 text-center font-condensed text-4xl font-black border-2 border-atsc-gris-claro rounded-xl outline-none focus:border-atsc-azul-claro py-2"
                  />
                  <span className="font-condensed text-4xl font-black text-atsc-gris-texto">-</span>
                  <input
                    type="number" value={golesVis} min="0"
                    onChange={e => { setGolesVis(e.target.value); setDirty(true) }}
                    className="w-16 text-center font-condensed text-4xl font-black border-2 border-atsc-gris-claro rounded-xl outline-none focus:border-atsc-azul-claro py-2"
                  />
                </div>
              )}
            </div>

            {/* Visitante */}
            <div className="flex-1 text-left">
              <div className="font-condensed text-2xl font-black text-atsc-azul-oscuro uppercase">
                {partido.equipoVisitante?.nombre}
              </div>
              <div className="text-xs text-atsc-gris-texto mt-1">Visitante</div>
            </div>
          </div>
        </div>
      </div>

      {/* Planilla */}
      <div className="card">
        <div className="card-header">
          <span className="card-title flex items-center gap-2">
            <Shield size={14} /> Planilla — {plantelEdit.length} jugadores
          </span>
          <div className="flex items-center gap-4 text-xs text-atsc-gris-texto">
            <span>GOL: <strong className="text-atsc-azul-oscuro">{totalGoles}</strong></span>
            <span>AM: <strong className="text-yellow-600">{totalAmarillas}</strong></span>
            <span>AZ: <strong className="text-blue-600">{totalAzules}</strong></span>
            <span>F: <strong className="text-atsc-rojo">{totalFaltas}</strong></span>
          </div>
        </div>

        {plantelEdit.length === 0 ? (
          <div className="text-center py-10 text-atsc-gris-texto text-sm">
            No hay jugadores en el plantel
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-atsc-gris-claro bg-atsc-azul-oscuro">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white w-24">N° Carnet</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Jugador</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white w-20">C</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-yellow-300 w-16">AM</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-300 w-16">AZ</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-red-300 w-16">F</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-green-300 w-16">GOL</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white w-20">Cap.</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white w-20">Susp.</th>
              </tr>
            </thead>
            <tbody>
              {plantelEdit.map((p, idx) => {
                const outAmarilla = Number(p.amarillas) >= 4
                const outAzul     = Number(p.azules)    >= 1
                const rowClass = p.suspendido
                  ? 'bg-red-50 border-b border-atsc-gris-claro'
                  : 'table-row'

                return (
                  <tr key={p.id} className={rowClass}>
                    <td className="table-cell text-atsc-gris-texto text-xs">{idx + 1}</td>
                    <td className="table-cell text-sm">
                      {p.persona?.nroCarnet || '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {p.capitan && <span title="Capitán">🏅</span>}
                        <span className="font-semibold text-sm">
                          {p.persona?.apellido}, {p.persona?.nombre}
                        </span>
                        {outAmarilla && <span className="badge-rojo text-[10px]">OUT x4 AM</span>}
                        {outAzul && <span className="badge-azul text-[10px]">OUT AZUL</span>}
                      </div>
                    </td>

                    {/* Camiseta */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span className="text-sm">{p.nroCamiseta || '—'}</span>
                      ) : (
                        <input type="number" value={p.nroCamiseta || ''} min="1"
                          onChange={e => actualizarJugador(p.id, 'nroCamiseta', e.target.value)}
                          className="w-14 px-1 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-atsc-azul-claro outline-none" />
                      )}
                    </td>

                    {/* AM */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span className={`text-sm font-bold ${Number(p.amarillas) > 0 ? 'text-yellow-600' : ''}`}>
                          {p.amarillas}
                        </span>
                      ) : (
                        <input type="number" value={p.amarillas} min="0"
                          onChange={e => actualizarJugador(p.id, 'amarillas', e.target.value)}
                          className="w-14 px-1 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-yellow-400 outline-none" />
                      )}
                    </td>

                    {/* AZ */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span className={`text-sm font-bold ${Number(p.azules) > 0 ? 'text-blue-600' : ''}`}>
                          {p.azules}
                        </span>
                      ) : (
                        <input type="number" value={p.azules} min="0"
                          onChange={e => actualizarJugador(p.id, 'azules', e.target.value)}
                          className="w-14 px-1 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-blue-400 outline-none" />
                      )}
                    </td>

                    {/* Faltas */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span className={`text-sm font-bold ${Number(p.faltas) > 0 ? 'text-atsc-rojo' : ''}`}>
                          {p.faltas}
                        </span>
                      ) : (
                        <input type="number" value={p.faltas} min="0"
                          onChange={e => actualizarJugador(p.id, 'faltas', e.target.value)}
                          className="w-14 px-1 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-atsc-rojo outline-none" />
                      )}
                    </td>

                    {/* Goles */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span className={`text-sm font-bold ${Number(p.goles) > 0 ? 'text-green-600' : ''}`}>
                          {p.goles}
                        </span>
                      ) : (
                        <input type="number" value={p.goles} min="0"
                          onChange={e => actualizarJugador(p.id, 'goles', e.target.value)}
                          className="w-14 px-1 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-green-500 outline-none" />
                      )}
                    </td>

                    {/* Capitán */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span>{p.capitan ? '🏅' : '—'}</span>
                      ) : (
                        <input type="checkbox" checked={p.capitan}
                          onChange={e => actualizarJugador(p.id, 'capitan', e.target.checked)}
                          className="w-4 h-4 accent-atsc-azul-claro" />
                      )}
                    </td>

                    {/* Suspendido */}
                    <td className="table-cell text-center">
                      {cerrado ? (
                        <span>{p.suspendido ? '🚫' : '—'}</span>
                      ) : (
                        <input type="checkbox" checked={p.suspendido}
                          onChange={e => actualizarJugador(p.id, 'suspendido', e.target.checked)}
                          className="w-4 h-4 accent-atsc-rojo" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Totales */}
            <tfoot>
              <tr className="border-t-2 border-atsc-azul-oscuro bg-atsc-fondo">
                <td colSpan={3} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-atsc-gris-texto">
                  Totales
                </td>
                <td className="px-4 py-3 text-center"></td>
                <td className="px-4 py-3 text-center font-black text-yellow-600">{totalAmarillas}</td>
                <td className="px-4 py-3 text-center font-black text-blue-600">{totalAzules}</td>
                <td className="px-4 py-3 text-center font-black text-atsc-rojo">{totalFaltas}</td>
                <td className="px-4 py-3 text-center font-black text-green-600">{totalGoles}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* Leyenda */}
        <div className="px-4 py-3 border-t border-atsc-gris-claro flex items-center gap-6 text-xs text-atsc-gris-texto">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded"></span> OUT x4 Amarillas</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> OUT x Azul Directa</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded"></span> Suspendido próximo partido</span>
        </div>
      </div>

      {/* Botón guardar flotante si hay cambios */}
      {!cerrado && dirty && (
        <div className="fixed bottom-6 right-6">
          <button onClick={guardarTodo} className="btn-primary shadow-xl px-6 py-3 text-base">
            <Save size={18} />
            Guardar planilla
          </button>
        </div>
      )}
    </div>
  )
}
