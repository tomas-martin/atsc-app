import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Search, Plus, X, Users } from 'lucide-react'
import { partidoService, torneoService, personaService } from '../services/api'
import toast from 'react-hot-toast'
import api from '../services/api'

const clubService = {
  getAll: () => api.get('/clubes'),
  create: (data) => api.post('/clubes', data),
}

export default function PartidoForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    fecha: '', fechaNro: '', torneoId: '',
    equipoLocalId: '', equipoVisId: '',
    golesLocal: 0, golesVisitante: 0,
  })
  const [plantel, setPlantel] = useState([])
  const [buscarJugador, setBuscarJugador] = useState('')
  const [nuevoEquipo, setNuevoEquipo] = useState('')
  const [creandoEquipo, setCreandoEquipo] = useState(false)

  const { data: torneos } = useQuery({
    queryKey: ['torneos'],
    queryFn: () => torneoService.getAll().then(r => r.data),
  })

  const { data: clubesData } = useQuery({
    queryKey: ['clubes'],
    queryFn: () => clubService.getAll().then(r => r.data),
  })
  const clubes = Array.isArray(clubesData) ? clubesData : (clubesData?.data || [])

  const { data: jugadoresData } = useQuery({
    queryKey: ['personas-busqueda', buscarJugador],
    queryFn: () => personaService.getAll({
      buscar: buscarJugador || undefined,
      estado: 'true', limit: 10
    }).then(r => r.data),
    enabled: buscarJugador.length >= 2,
  })
  const jugadoresBusqueda = jugadoresData?.data || []

  const mutation = useMutation({
    mutationFn: (data) => partidoService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['partidos'])
      toast.success('Partido creado')
      navigate(`/partidos/${res.data.id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear partido')
  })

  const crearEquipoMutation = useMutation({
    mutationFn: (nombre) => clubService.create({ nombre }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['clubes'])
      toast.success('Equipo creado')
      setNuevoEquipo('')
      setCreandoEquipo(false)
    },
    onError: () => toast.error('Error al crear equipo')
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const agregarJugador = (jugador) => {
    if (plantel.find(p => p.personaId === jugador.id)) {
      toast.error('El jugador ya está en el plantel')
      return
    }
    setPlantel(prev => [...prev, {
      personaId: jugador.id,
      nombre: `${jugador.apellido}, ${jugador.nombre}`,
      nroCarnet: jugador.nroCarnet || '',
      nroCamiseta: '',
      capitan: false,
      goles: 0, amarillas: 0, azules: 0, faltas: 0,
    }])
    setBuscarJugador('')
  }

  const quitarJugador = (personaId) => {
    setPlantel(prev => prev.filter(p => p.personaId !== personaId))
  }

  const actualizarJugador = (personaId, campo, valor) => {
    setPlantel(prev => prev.map(p =>
      p.personaId === personaId ? { ...p, [campo]: valor } : p
    ))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.fecha) return toast.error('La fecha es obligatoria')
    if (!form.torneoId) return toast.error('Seleccioná un torneo')
    if (!form.equipoLocalId) return toast.error('Seleccioná el equipo local')
    if (!form.equipoVisId) return toast.error('Seleccioná el equipo visitante')

    mutation.mutate({
      fecha: form.fecha,
      fechaNro: form.fechaNro ? Number(form.fechaNro) : null,
      torneoId: Number(form.torneoId),
      equipoLocalId: Number(form.equipoLocalId),
      equipoVisId: Number(form.equipoVisId),
      golesLocal: Number(form.golesLocal),
      golesVisitante: Number(form.golesVisitante),
      plantel: plantel.map(p => ({
        personaId: p.personaId,
        nroCamiseta: p.nroCamiseta ? Number(p.nroCamiseta) : null,
        capitan: p.capitan,
        goles: Number(p.goles),
        amarillas: Number(p.amarillas),
        azules: Number(p.azules),
        faltas: Number(p.faltas),
      }))
    })
  }

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => navigate('/partidos')} className="btn-ghost px-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
            Nuevo Partido
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-0.5">
            Cargá los datos del partido y el plantel convocado
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Datos del partido */}
        <div className="card mb-5">
          <div className="card-header">
            <span className="card-title">Datos del Partido</span>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4">

            <div>
              <label className="label">Torneo *</label>
              <select name="torneoId" value={form.torneoId} onChange={handleChange} className="input">
                <option value="">— Seleccioná —</option>
                {torneos?.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Fecha *</label>
              <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="input" required />
            </div>

            <div>
              <label className="label">N° de Fecha</label>
              <input name="fechaNro" type="number" value={form.fechaNro} onChange={handleChange}
                className="input" placeholder="1" min="1" />
            </div>

            {/* Resultado */}
            <div className="col-span-3">
              <div className="bg-atsc-fondo rounded-xl p-4">
                <div className="flex items-center gap-4">

                  <div className="flex-1">
                    <label className="label">Equipo Local *</label>
                    <select name="equipoLocalId" value={form.equipoLocalId} onChange={handleChange} className="input">
                      <option value="">— Seleccioná —</option>
                      {clubes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>

                  <div className="flex items-end gap-3 pb-0.5">
                    <div className="text-center">
                      <label className="label">Goles</label>
                      <input name="golesLocal" type="number" value={form.golesLocal} onChange={handleChange}
                        className="input w-16 text-center text-xl font-black" min="0" />
                    </div>
                    <span className="font-condensed text-2xl font-black text-atsc-gris-texto pb-2">-</span>
                    <div className="text-center">
                      <label className="label">Goles</label>
                      <input name="golesVisitante" type="number" value={form.golesVisitante} onChange={handleChange}
                        className="input w-16 text-center text-xl font-black" min="0" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="label">Equipo Visitante *</label>
                    <select name="equipoVisId" value={form.equipoVisId} onChange={handleChange} className="input">
                      <option value="">— Seleccioná —</option>
                      {clubes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>

                {/* Crear equipo nuevo */}
                {!creandoEquipo ? (
                  <button type="button" onClick={() => setCreandoEquipo(true)}
                    className="mt-3 text-xs text-atsc-azul-claro hover:underline flex items-center gap-1">
                    <Plus size={12} /> ¿No encontrás el equipo? Crealo acá
                  </button>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={nuevoEquipo}
                      onChange={e => setNuevoEquipo(e.target.value)}
                      placeholder="Nombre del equipo nuevo"
                      className="input flex-1"
                    />
                    <button type="button"
                      onClick={() => nuevoEquipo.trim() && crearEquipoMutation.mutate(nuevoEquipo.trim())}
                      className="btn-primary text-xs px-3 py-2">
                      Crear
                    </button>
                    <button type="button" onClick={() => setCreandoEquipo(false)}
                      className="btn-ghost px-2 py-2"><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Plantel */}
        <div className="card mb-5">
          <div className="card-header">
            <span className="card-title flex items-center gap-2">
              <Users size={14} /> Plantel convocado
            </span>
            <span className="badge-azul">{plantel.length} jugadores</span>
          </div>

          {/* Buscador */}
          <div className="p-4 border-b border-atsc-gris-claro">
            <div className="relative max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-atsc-gris-texto" />
              <input
                type="text"
                placeholder="Buscar jugador por nombre o apellido..."
                value={buscarJugador}
                onChange={e => setBuscarJugador(e.target.value)}
                className="input pl-9"
              />
            </div>

            {/* Resultados búsqueda */}
            {buscarJugador.length >= 2 && jugadoresBusqueda.length > 0 && (
              <div className="mt-2 border border-atsc-gris-claro rounded-lg overflow-hidden max-w-sm">
                {jugadoresBusqueda.map(j => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => agregarJugador(j)}
                    className="w-full text-left px-4 py-2.5 hover:bg-atsc-fondo flex items-center justify-between text-sm border-b border-atsc-gris-claro last:border-0"
                  >
                    <span className="font-medium">{j.apellido}, {j.nombre}</span>
                    <span className="text-atsc-gris-texto text-xs flex items-center gap-1">
                      <Plus size={12} /> Agregar
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabla plantel */}
          {plantel.length === 0 ? (
            <div className="text-center py-10 text-atsc-gris-texto text-sm">
              Buscá jugadores arriba para agregarlos al plantel
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-atsc-gris-claro">
                  <th className="table-header">Jugador</th>
                  <th className="table-header text-center w-20">Camiseta</th>
                  <th className="table-header text-center w-16">Capitán</th>
                  <th className="table-header text-center w-16">AM</th>
                  <th className="table-header text-center w-16">AZ</th>
                  <th className="table-header text-center w-16">F</th>
                  <th className="table-header text-center w-16">GOL</th>
                  <th className="table-header w-10"></th>
                </tr>
              </thead>
              <tbody>
                {plantel.map(p => (
                  <tr key={p.personaId} className="table-row">
                    <td className="table-cell">
                      <div className="font-semibold text-sm">{p.nombre}</div>
                      {p.nroCarnet && <div className="text-xs text-atsc-gris-texto">Carnet: {p.nroCarnet}</div>}
                    </td>
                    <td className="table-cell text-center">
                      <input type="number" value={p.nroCamiseta} min="1"
                        onChange={e => actualizarJugador(p.personaId, 'nroCamiseta', e.target.value)}
                        className="w-14 px-2 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-atsc-azul-claro outline-none" />
                    </td>
                    <td className="table-cell text-center">
                      <input type="checkbox" checked={p.capitan}
                        onChange={e => actualizarJugador(p.personaId, 'capitan', e.target.checked)}
                        className="w-4 h-4 accent-atsc-azul-claro" />
                    </td>
                    {['amarillas','azules','faltas','goles'].map(campo => (
                      <td key={campo} className="table-cell text-center">
                        <input type="number" value={p[campo]} min="0"
                          onChange={e => actualizarJugador(p.personaId, campo, e.target.value)}
                          className="w-14 px-2 py-1 text-center border-2 border-atsc-gris-claro rounded-lg text-sm focus:border-atsc-azul-claro outline-none" />
                      </td>
                    ))}
                    <td className="table-cell">
                      <button type="button" onClick={() => quitarJugador(p.personaId)}
                        className="btn-ghost px-2 py-1 text-atsc-rojo hover:bg-red-50">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/partidos')} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isLoading} className="btn-primary">
            <Save size={15} />
            {mutation.isLoading ? 'Guardando...' : 'Crear partido'}
          </button>
        </div>

      </form>
    </div>
  )
}
