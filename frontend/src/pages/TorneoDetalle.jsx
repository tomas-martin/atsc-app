import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Users, Trophy, BarChart2, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { torneoService } from '../services/api'
import api from '../services/api'

const torneoDetalleService = {
  getFixture:   (id) => api.get(`/torneos/${id}/fixture`),
  getPosiciones:(id) => api.get(`/torneos/${id}/posiciones`),
  getPlantel:   (id) => api.get(`/torneos/${id}/plantel`),
  getHistorial: (id) => api.get(`/torneos/${id}/historial`),
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

function StatBox({ label, stats, color }) {
  const barColor = color === 'rojo' ? 'bg-atsc-rojo' : color === 'azul' ? 'bg-atsc-azul-claro' : 'bg-atsc-azul-oscuro'
  return (
    <div className="card overflow-hidden">
      <div className={`h-1.5 ${barColor}`} />
      <div className="p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-atsc-gris-texto mb-3">{label}</div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {[['PTS', stats.pts], ['PJ', stats.pj], ['PG', stats.pg], ['PE', stats.pe], ['PP', stats.pp], ['GF', stats.gf], ['GC', stats.gc]].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10px] text-atsc-gris-texto uppercase">{k}</div>
              <div className="font-condensed font-black text-xl text-atsc-azul-oscuro">{v ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TorneoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab]         = useState('fixture')
  const [fechaIdx, setFechaIdx] = useState(0)

  const { data: torneo } = useQuery({
    queryKey: ['torneo', id],
    queryFn: () => torneoService.getById(id).then(r => r.data),
  })

  const { data: fixture = [], isLoading: loadingFixture } = useQuery({
    queryKey: ['torneo-fixture', id],
    queryFn: () => torneoDetalleService.getFixture(id).then(r => r.data),
    enabled: tab === 'fixture',
  })

  const { data: posiciones = [], isLoading: loadingPos } = useQuery({
    queryKey: ['torneo-posiciones', id],
    queryFn: () => torneoDetalleService.getPosiciones(id).then(r => r.data),
    enabled: tab === 'tabla',
  })

  const { data: plantel = [], isLoading: loadingPlantel } = useQuery({
    queryKey: ['torneo-plantel', id],
    queryFn: () => torneoDetalleService.getPlantel(id).then(r => r.data),
    enabled: tab === 'plantel',
  })

  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ['torneo-historial', id],
    queryFn: () => torneoDetalleService.getHistorial(id).then(r => r.data),
    enabled: tab === 'historial',
  })

  const fechaActual = fixture[fechaIdx]

  const tabs = [
    { key: 'fixture',  label: 'Fixture',   icon: Calendar },
    { key: 'plantel',  label: 'Plantel',   icon: Users },
    { key: 'tabla',    label: 'Tabla',     icon: Trophy },
    { key: 'historial',label: 'Historial', icon: BarChart2 },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/torneos')} className="btn-ghost px-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-condensed text-2xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
            {torneo?.nombre}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {torneo?.fecha && <span className="badge-azul">{torneo.fecha}</span>}
            {torneo?.categoria && <span className="badge-gris">{torneo.categoria.nombre}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-atsc-gris-claro mb-6 gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 font-condensed font-bold text-sm uppercase tracking-wide transition-all border-b-2 -mb-px ${
              tab === key
                ? 'border-atsc-rojo text-atsc-azul-oscuro'
                : 'border-transparent text-atsc-gris-texto hover:text-atsc-azul-oscuro'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── FIXTURE ── */}
      {tab === 'fixture' && (
        <div>
          {loadingFixture ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
            </div>
          ) : fixture.length === 0 ? (
            <div className="card p-8 text-center text-atsc-gris-texto">No hay partidos cargados</div>
          ) : (
            <div>
              {/* Navegador de fechas */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setFechaIdx(i => Math.max(0, i-1))}
                  disabled={fechaIdx === 0}
                  className="btn-ghost px-2 disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {fixture.map((f, i) => (
                    <button
                      key={f.fechaNro}
                      onClick={() => setFechaIdx(i)}
                      className={`w-9 h-9 rounded-lg font-condensed font-bold text-sm transition-all ${
                        i === fechaIdx
                          ? 'bg-atsc-rojo text-white'
                          : 'bg-atsc-fondo text-atsc-gris-texto hover:bg-atsc-gris-claro'
                      }`}
                    >
                      {f.fechaNro}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setFechaIdx(i => Math.min(fixture.length-1, i+1))}
                  disabled={fechaIdx === fixture.length-1}
                  className="btn-ghost px-2 disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Partidos de la fecha */}
              {fechaActual && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Fecha {fechaActual.fechaNro}</span>
                    <span className="badge-gris">{fechaActual.partidos.length} partidos</span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-atsc-gris-claro bg-atsc-azul-oscuro">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-white">Fecha</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-white">Local</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white w-28">Resultado</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-white">Visitante</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-white w-20">Estado</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fechaActual.partidos.map(p => {
                        const esATSC_local = p.equipoLocal?.nombre?.toUpperCase().includes('TALLERES')
                        const esATSC_vis   = p.equipoVisitante?.nombre?.toUpperCase().includes('TALLERES')
                        const rowClass = (esATSC_local || esATSC_vis)
                          ? 'border-b border-atsc-gris-claro bg-blue-50/40'
                          : 'border-b border-atsc-gris-claro hover:bg-atsc-fondo/50'
                        return (
                          <tr key={p.id} className={rowClass}>
                            <td className="px-4 py-3 text-sm text-atsc-gris-texto">{formatFecha(p.fecha)}</td>
                            <td className={`px-4 py-3 text-right text-sm font-semibold ${esATSC_local ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                              {p.equipoLocal?.nombre || '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {p.cerrado ? (
                                <span className="font-condensed font-black text-xl text-atsc-azul-oscuro">
                                  {p.golesLocal} - {p.golesVisitante}
                                </span>
                              ) : (
                                <span className="text-atsc-gris-texto text-sm">vs</span>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-sm font-semibold ${esATSC_vis ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                              {p.equipoVisitante?.nombre || '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {p.cerrado
                                ? <span className="badge-gris flex items-center gap-1 justify-center text-[10px]"><Lock size={9} />Cerrado</span>
                                : <span className="badge-verde text-[10px]">Pendiente</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => navigate(`/partidos/${p.id}`)}
                                className="btn-ghost px-2 py-1 text-xs"
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PLANTEL ── */}
      {tab === 'plantel' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title flex items-center gap-2"><Users size={14} /> Plantel ATSC — Estadísticas del torneo</span>
            <span className="badge-azul">{plantel.length} jugadores</span>
          </div>
          {loadingPlantel ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" /></div>
          ) : plantel.length === 0 ? (
            <div className="text-center py-10 text-atsc-gris-texto text-sm">No hay datos del plantel para este torneo</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-atsc-gris-claro bg-atsc-azul-oscuro">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white w-8">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Jugador</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-14">PJ</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-green-300 w-14">⚽</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-red-300 w-14">F</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-yellow-300 w-14">AM</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-blue-300 w-14">AZ</th>
                </tr>
              </thead>
              <tbody>
                {plantel.map((p, idx) => (
                  <tr key={p.persona?.id} className="table-row">
                    <td className="table-cell text-atsc-gris-texto text-xs">{idx + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {p.persona?.foto
                            ? <img src={p.persona.foto} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gradient-to-br from-atsc-azul-claro to-atsc-azul-oscuro flex items-center justify-center text-white font-bold text-xs">
                                {p.persona?.apellido?.[0]}{p.persona?.nombre?.[0]}
                              </div>
                          }
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-atsc-azul-oscuro">
                            {p.persona?.apellido}, {p.persona?.nombre}
                          </div>
                          {p.persona?.nroCarnet && (
                            <div className="text-xs text-atsc-gris-texto">Carnet: {p.persona.nroCarnet}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center font-semibold">{p.pj}</td>
                    <td className="table-cell text-center">
                      {p.goles > 0 ? <span className="badge-verde font-bold">{p.goles}</span> : <span className="text-atsc-gris-texto">0</span>}
                    </td>
                    <td className="table-cell text-center">
                      {p.faltas > 0 ? <span className="text-atsc-rojo font-bold">{p.faltas}</span> : <span className="text-atsc-gris-texto">0</span>}
                    </td>
                    <td className="table-cell text-center">
                      {p.amarillas > 0 ? <span className="text-yellow-600 font-bold">{p.amarillas}</span> : <span className="text-atsc-gris-texto">0</span>}
                    </td>
                    <td className="table-cell text-center">
                      {p.azules > 0 ? <span className="text-blue-600 font-bold">{p.azules}</span> : <span className="text-atsc-gris-texto">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-atsc-azul-oscuro bg-atsc-fondo">
                  <td colSpan={2} className="px-4 py-3 text-xs font-bold uppercase text-atsc-gris-texto">Totales</td>
                  <td className="px-4 py-3 text-center font-black text-atsc-azul-oscuro">—</td>
                  <td className="px-4 py-3 text-center font-black text-green-600">{plantel.reduce((s,p)=>s+p.goles,0)}</td>
                  <td className="px-4 py-3 text-center font-black text-atsc-rojo">{plantel.reduce((s,p)=>s+p.faltas,0)}</td>
                  <td className="px-4 py-3 text-center font-black text-yellow-600">{plantel.reduce((s,p)=>s+p.amarillas,0)}</td>
                  <td className="px-4 py-3 text-center font-black text-blue-600">{plantel.reduce((s,p)=>s+p.azules,0)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* ── TABLA DE POSICIONES ── */}
      {tab === 'tabla' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title flex items-center gap-2"><Trophy size={14} /> Tabla de Posiciones</span>
          </div>
          {loadingPos ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" /></div>
          ) : posiciones.length === 0 ? (
            <div className="text-center py-10 text-atsc-gris-texto text-sm">No hay partidos cerrados todavía</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-atsc-gris-claro bg-atsc-azul-oscuro">
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Equipo</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-14">PTS</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-12">PJ</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-12">PG</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-12">PE</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-12">PP</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-12">GF</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-12">GC</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-14">DIF</th>
                </tr>
              </thead>
              <tbody>
                {posiciones.map((p, idx) => {
                  const esATSC = p.equipo?.nombre?.toUpperCase().includes('TALLERES')
                  return (
                    <tr key={p.equipo?.id} className={`border-b border-atsc-gris-claro ${esATSC ? 'bg-blue-50' : 'hover:bg-atsc-fondo/50'}`}>
                      <td className="px-4 py-3 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-sm text-atsc-gris-texto">{idx+1}</span>}
                      </td>
                      <td className={`px-4 py-3 font-semibold text-sm ${esATSC ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                        {p.equipo?.nombre || '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-condensed font-black text-lg text-atsc-azul-oscuro">{p.pts}</td>
                      <td className="px-4 py-3 text-center text-sm">{p.pj}</td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-semibold">{p.pg}</td>
                      <td className="px-4 py-3 text-center text-sm">{p.pe}</td>
                      <td className="px-4 py-3 text-center text-sm text-atsc-rojo font-semibold">{p.pp}</td>
                      <td className="px-4 py-3 text-center text-sm">{p.gf}</td>
                      <td className="px-4 py-3 text-center text-sm">{p.gc}</td>
                      <td className={`px-4 py-3 text-center text-sm font-bold ${p.dif > 0 ? 'text-green-600' : p.dif < 0 ? 'text-atsc-rojo' : 'text-atsc-gris-texto'}`}>
                        {p.dif > 0 ? `+${p.dif}` : p.dif}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── HISTORIAL ── */}
      {tab === 'historial' && (
        <div className="space-y-5">
          {loadingHistorial ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" /></div>
          ) : !historial ? null : (
            <>
              {/* Stats boxes */}
              <div className="grid grid-cols-3 gap-4">
                <StatBox label="Como Local"     stats={historial.stats.local}     color="azul" />
                <StatBox label="Como Visitante" stats={historial.stats.visitante}  color="rojo" />
                <div className="card overflow-hidden">
                  <div className="h-1.5 bg-atsc-azul-oscuro" />
                  <div className="p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-atsc-gris-texto mb-3">General</div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-3">
                      {[['PTS', historial.stats.general.pts], ['PJ', historial.stats.general.pj], ['PG', historial.stats.general.pg], ['PE', historial.stats.general.pe], ['PP', historial.stats.general.pp], ['GF', historial.stats.general.gf], ['GC', historial.stats.general.gc]].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[10px] text-atsc-gris-texto uppercase">{k}</div>
                          <div className="font-condensed font-black text-xl text-atsc-azul-oscuro">{v ?? 0}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <span className="font-condensed text-3xl font-black text-atsc-azul-oscuro">{historial.stats.general.pctPuntos}%</span>
                      <div className="text-xs text-atsc-gris-texto">% de puntos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de partidos */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Partidos de ATSC</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-atsc-gris-claro bg-atsc-azul-oscuro">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Fecha</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white">Jornada</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Local</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white w-28">Resultado</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white">Visitante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.partidos.map(p => {
                      const gano  = p.cerrado && p.golesATSC > p.golesRival
                      const empato = p.cerrado && p.golesATSC === p.golesRival
                      const perdio = p.cerrado && p.golesATSC < p.golesRival
                      const rowColor = !p.cerrado ? '' : gano ? 'bg-green-50' : empato ? 'bg-yellow-50' : 'bg-red-50'
                      return (
                        <tr key={p.id} className={`border-b border-atsc-gris-claro hover:opacity-90 cursor-pointer ${rowColor}`}
                          onClick={() => navigate(`/partidos/${p.id}`)}>
                          <td className="px-4 py-3 text-sm text-atsc-gris-texto">{formatFecha(p.fecha)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="badge-azul text-[11px]">F{p.fechaNro}</span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-semibold ${p.esLocal ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                            {p.equipoLocal?.nombre}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.cerrado ? (
                              <span className="font-condensed font-black text-lg text-atsc-azul-oscuro">
                                {p.golesLocal} - {p.golesVisitante}
                              </span>
                            ) : (
                              <span className="text-atsc-gris-texto text-sm">vs</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-sm font-semibold ${!p.esLocal ? 'text-atsc-azul-claro' : 'text-atsc-azul-oscuro'}`}>
                            {p.equipoVisitante?.nombre}
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
      )}
    </div>
  )
}
