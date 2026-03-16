import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Phone, Mail, MapPin, CreditCard, Calendar, Trophy, Plus, Trash2 } from 'lucide-react'
import { personaService, cuotaService } from '../services/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

const MESES_NOMBRE = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function calcularEdad(fechaNac) {
  if (!fechaNac) return null
  const hoy = new Date()
  const nac = new Date(fechaNac)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

function formatFecha(f) {
  if (!f) return '—'
  const d = new Date(f)
  return `${d.getDate()} ${MESES_NOMBRE[d.getMonth()].slice(0,3)} ${d.getFullYear()}`
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-atsc-gris-claro last:border-0">
      <div className="w-7 h-7 bg-atsc-fondo rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-atsc-gris-texto" />
      </div>
      <div>
        <div className="text-xs text-atsc-gris-texto uppercase tracking-wide font-semibold">{label}</div>
        <div className="text-sm text-atsc-azul-oscuro font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export default function JugadorFicha() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formCuota, setFormCuota] = useState({ mes: new Date().getMonth() + 1, anio: new Date().getFullYear(), monto: '' })
  const [mostrarCuota, setMostrarCuota] = useState(false)

  const { data: persona, isLoading } = useQuery({
    queryKey: ['persona', id],
    queryFn: () => personaService.getById(id).then(r => r.data),
  })

  const addCuota = useMutation({
    mutationFn: (data) => cuotaService.registrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['persona', id])
      setMostrarCuota(false)
      setFormCuota({ mes: new Date().getMonth() + 1, anio: new Date().getFullYear(), monto: '' })
      toast.success('Cuota registrada')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al registrar cuota')
  })

  const delCuota = useMutation({
    mutationFn: (cuotaId) => cuotaService.delete(cuotaId),
    onSuccess: () => {
      queryClient.invalidateQueries(['persona', id])
      toast.success('Cuota eliminada')
    }
  })

  const handleAddCuota = (e) => {
    e.preventDefault()
    if (!formCuota.monto) return toast.error('Ingresá el monto')
    addCuota.mutate({
      personaId: Number(id),
      mes: Number(formCuota.mes),
      anio: Number(formCuota.anio),
      monto: Number(formCuota.monto),
      fecha: new Date().toISOString().split('T')[0],
    })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
    </div>
  )

  if (!persona) return (
    <div className="max-w-[1200px] mx-auto px-8 py-7 text-center text-atsc-gris-texto">
      Jugador no encontrado
    </div>
  )

  const edad = calcularEdad(persona.fechaNac)
  const nombre = `${persona.apellido}, ${persona.nombre}`
  const cuotas = persona.cuotas || []

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => navigate('/jugadores')} className="btn-ghost px-2">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
              {nombre}
            </h1>
            {persona.alias && (
              <span className="text-atsc-gris-texto font-condensed text-xl">"{persona.alias}"</span>
            )}
            <span className={persona.estado ? 'badge-verde' : 'badge-gris'}>
              {persona.estado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          {persona.tiposPersona?.map(tp => (
            <span key={tp.tipoId} className="badge-azul text-xs mr-1">{tp.tipo?.nombre}</span>
          ))}
        </div>
        <button onClick={() => navigate(`/jugadores/${id}/editar`)} className="btn-outline">
          <Pencil size={14} />
          Editar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Columna izquierda: Datos */}
        <div className="col-span-1 space-y-5">

          {/* Avatar + stats rápidos */}
          <div className="card overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-atsc-azul-oscuro to-atsc-azul-claro" />
            <div className="p-5 text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
  {persona.foto
    ? <img src={persona.foto} alt={nombre} className="w-full h-full object-cover" />
    : <div className="w-full h-full bg-gradient-to-br from-atsc-azul-claro to-atsc-azul-oscuro flex items-center justify-center text-white font-condensed font-black text-3xl">
        {persona.apellido[0]}{persona.nombre[0]}
      </div>
  }
</div>
              <div className="font-condensed text-xl font-black text-atsc-azul-oscuro">{nombre}</div>
              {persona.nroSocio && (
                <div className="text-xs text-atsc-gris-texto mt-1">Socio N° {persona.nroSocio}</div>
              )}
              {edad !== null && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-atsc-fondo px-3 py-1.5 rounded-full">
                  <Calendar size={12} className="text-atsc-gris-texto" />
                  <span className="text-sm font-semibold text-atsc-azul-oscuro">{edad} años</span>
                </div>
              )}
            </div>
          </div>

          {/* Datos personales */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Datos Personales</span>
            </div>
            <div className="px-4 pb-2">
              <InfoRow icon={CreditCard} label="DNI" value={persona.documento} />
              <InfoRow icon={CreditCard} label="N° Carnet" value={persona.nroCarnet} />
              <InfoRow icon={Calendar}   label="Nacimiento" value={formatFecha(persona.fechaNac)} />
              <InfoRow icon={Trophy}     label="Grupo sanguíneo" value={persona.grupo} />
              <InfoRow icon={Trophy}     label="Obra social" value={persona.obraSocial} />
            </div>
          </div>

          {/* Contacto */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Contacto</span>
            </div>
            <div className="px-4 pb-2">
              <InfoRow icon={MapPin} label="Domicilio" value={persona.domicilio} />
              <InfoRow icon={MapPin} label="Localidad"  value={persona.localidad} />
              <InfoRow icon={Phone}  label="Teléfono"   value={persona.telefono} />
              <InfoRow icon={Phone}  label="Teléfono 2" value={persona.telefono1} />
              <InfoRow icon={Phone}  label="Teléfono 3" value={persona.telefono2} />
              <InfoRow icon={Mail}   label="Email"      value={persona.mail} />
              <InfoRow icon={Mail}   label="Email 2"    value={persona.mail2} />
            </div>
          </div>
        </div>

        {/* Columna derecha: Cuotas + historial */}
        <div className="col-span-2 space-y-5">

          {/* Cuotas */}
          <div className="card">
            <div className="card-header">
              <span className="card-title flex items-center gap-2">
                <CreditCard size={14} /> Cuotas
              </span>
              <button
                onClick={() => setMostrarCuota(v => !v)}
                className="btn-primary text-xs px-3 py-1.5"
              >
                <Plus size={13} />
                Registrar cuota
              </button>
            </div>

            {/* Formulario nueva cuota */}
            {mostrarCuota && (
              <div className="mx-4 mb-4 p-4 bg-atsc-fondo rounded-xl border border-atsc-gris-claro">
                <p className="label mb-3">Nueva cuota</p>
                <form onSubmit={handleAddCuota} className="flex items-end gap-3">
                  <div>
                    <label className="label">Mes</label>
                    <select
                      value={formCuota.mes}
                      onChange={e => setFormCuota(f => ({ ...f, mes: e.target.value }))}
                      className="input w-36"
                    >
                      {MESES_NOMBRE.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Año</label>
                    <input
                      type="number" value={formCuota.anio} min="2020" max="2030"
                      onChange={e => setFormCuota(f => ({ ...f, anio: e.target.value }))}
                      className="input w-24"
                    />
                  </div>
                  <div>
                    <label className="label">Monto ($)</label>
                    <input
                      type="number" value={formCuota.monto} min="0" step="0.01"
                      onChange={e => setFormCuota(f => ({ ...f, monto: e.target.value }))}
                      placeholder="5000"
                      className="input w-28"
                    />
                  </div>
                  <button type="submit" disabled={addCuota.isLoading} className="btn-primary">
                    {addCuota.isLoading ? '...' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => setMostrarCuota(false)} className="btn-outline">
                    Cancelar
                  </button>
                </form>
              </div>
            )}

            {/* Lista de cuotas */}
            {cuotas.length === 0 ? (
              <div className="text-center py-8 text-atsc-gris-texto text-sm">
                No hay cuotas registradas
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-atsc-gris-claro">
                    <th className="table-header">Período</th>
                    <th className="table-header">Fecha pago</th>
                    <th className="table-header text-right">Monto</th>
                    <th className="table-header w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map(c => (
                    <tr key={c.id} className="table-row">
                      <td className="table-cell font-semibold">
                        {MESES_NOMBRE[c.mes - 1]} {c.anio}
                      </td>
                      <td className="table-cell text-sm text-atsc-gris-texto">
                        {formatFecha(c.fecha)}
                      </td>
                      <td className="table-cell text-right font-semibold text-atsc-azul-oscuro">
                        ${Number(c.monto).toLocaleString('es-AR')}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar esta cuota?')) delCuota.mutate(c.id)
                          }}
                          className="btn-ghost px-2 py-1 text-atsc-rojo hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-atsc-gris-claro">
                    <td colSpan={2} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-atsc-gris-texto">
                      Total pagado
                    </td>
                    <td className="px-4 py-3 text-right font-black text-atsc-azul-oscuro">
                      ${cuotas.reduce((s, c) => s + Number(c.monto), 0).toLocaleString('es-AR')}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Historial de partidos */}
          {persona.plantelPartidos && persona.plantelPartidos.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title flex items-center gap-2">
                  <Trophy size={14} /> Historial de Partidos
                </span>
                <span className="badge-azul">{persona.plantelPartidos.length} partidos</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-atsc-gris-claro">
                    <th className="table-header">Fecha</th>
                    <th className="table-header">Partido</th>
                    <th className="table-header text-center">Goles</th>
                    <th className="table-header text-center">⚠️</th>
                    <th className="table-header text-center">🟦</th>
                  </tr>
                </thead>
                <tbody>
                  {persona.plantelPartidos.slice(0, 10).map(pp => (
                    <tr key={pp.id} className="table-row">
                      <td className="table-cell text-sm">—</td>
                      <td className="table-cell text-sm">Partido #{pp.partidoId}</td>
                      <td className="table-cell text-center">
                        {pp.goles > 0 ? <span className="badge-verde">{pp.goles}</span> : '—'}
                      </td>
                      <td className="table-cell text-center">
                        {pp.amarillas > 0 ? <span className="badge-rojo">{pp.amarillas}</span> : '—'}
                      </td>
                      <td className="table-cell text-center">
                        {pp.azules > 0 ? <span className="badge-azul">{pp.azules}</span> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
