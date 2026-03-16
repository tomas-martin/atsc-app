import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, User } from 'lucide-react'
import { personaService } from '../services/api'
import toast from 'react-hot-toast'

const GRUPOS_SANGRE = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function JugadorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    apellido: '', nombre: '', alias: '', documento: '',
    nroCarnet: '', fechaNac: '', domicilio: '', localidad: '',
    grupo: '', obraSocial: '', telefono: '', telefono1: '', telefono2: '',
    mail: '', mail2: '', nroSocio: '', estado: true,
  })

  // Cargar datos si es edición
  const { data: persona, isLoading: cargando } = useQuery({
    queryKey: ['persona', id],
    queryFn: () => personaService.getById(id).then(r => r.data),
    enabled: esEdicion,
  })

  useEffect(() => {
    if (persona) {
      setForm({
        apellido:   persona.apellido   || '',
        nombre:     persona.nombre     || '',
        alias:      persona.alias      || '',
        documento:  persona.documento  || '',
        nroCarnet:  persona.nroCarnet  || '',
        fechaNac:   persona.fechaNac ? persona.fechaNac.split('T')[0] : '',
        domicilio:  persona.domicilio  || '',
        localidad:  persona.localidad  || '',
        grupo:      persona.grupo      || '',
        obraSocial: persona.obraSocial || '',
        telefono:   persona.telefono   || '',
        telefono1:  persona.telefono1  || '',
        telefono2:  persona.telefono2  || '',
        mail:       persona.mail       || '',
        mail2:      persona.mail2      || '',
        nroSocio:   persona.nroSocio   || '',
        estado:     persona.estado,
      })
    }
  }, [persona])

  const mutation = useMutation({
    mutationFn: (data) => esEdicion
      ? personaService.update(id, data)
      : personaService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['personas'])
      if (esEdicion) queryClient.invalidateQueries(['persona', id])
      toast.success(esEdicion ? 'Jugador actualizado' : 'Jugador creado')
      navigate(esEdicion ? `/jugadores/${id}` : '/jugadores')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error al guardar')
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.apellido.trim() || !form.nombre.trim()) {
      toast.error('Apellido y nombre son obligatorios')
      return
    }
    const data = { ...form }
    if (data.nroSocio === '') data.nroSocio = null
    mutation.mutate(data)
  }

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-[900px] mx-auto px-8 py-7">

      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => navigate('/jugadores')} className="btn-ghost px-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
            {esEdicion ? 'Editar Jugador' : 'Nuevo Jugador'}
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-0.5">
            {esEdicion ? `Modificando datos de ${persona?.apellido}, ${persona?.nombre}` : 'Completá los datos del nuevo jugador'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Datos personales */}
        <div className="card mb-5">
          <div className="card-header">
            <span className="card-title flex items-center gap-2">
              <User size={14} /> Datos Personales
            </span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">

            <div>
              <label className="label">Apellido *</label>
              <input name="apellido" value={form.apellido} onChange={handleChange}
                className="input" placeholder="García" required />
            </div>

            <div>
              <label className="label">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange}
                className="input" placeholder="Juan" required />
            </div>

            <div>
              <label className="label">Alias / Apodo</label>
              <input name="alias" value={form.alias} onChange={handleChange}
                className="input" placeholder="El Pato" />
            </div>

            <div>
              <label className="label">N° Socio</label>
              <input name="nroSocio" type="number" value={form.nroSocio} onChange={handleChange}
                className="input" placeholder="101" />
            </div>

            <div>
              <label className="label">DNI</label>
              <input name="documento" value={form.documento} onChange={handleChange}
                className="input" placeholder="30.123.456" />
            </div>

            <div>
              <label className="label">N° Carnet</label>
              <input name="nroCarnet" value={form.nroCarnet} onChange={handleChange}
                className="input" placeholder="ATC-001" />
            </div>

            <div>
              <label className="label">Fecha de Nacimiento</label>
              <input name="fechaNac" type="date" value={form.fechaNac} onChange={handleChange}
                className="input" />
            </div>

            <div>
              <label className="label">Grupo Sanguíneo</label>
              <select name="grupo" value={form.grupo} onChange={handleChange} className="input">
                <option value="">— Sin especificar —</option>
                {GRUPOS_SANGRE.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Obra Social</label>
              <input name="obraSocial" value={form.obraSocial} onChange={handleChange}
                className="input" placeholder="OSDE, PAMI..." />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" name="estado" id="estado" checked={form.estado}
                onChange={handleChange} className="w-4 h-4 accent-atsc-azul-claro" />
              <label htmlFor="estado" className="text-sm font-semibold text-atsc-azul-oscuro cursor-pointer">
                Jugador activo
              </label>
            </div>

          </div>
        </div>

        {/* Contacto */}
        <div className="card mb-5">
          <div className="card-header">
            <span className="card-title">Contacto y Domicilio</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className="label">Domicilio</label>
              <input name="domicilio" value={form.domicilio} onChange={handleChange}
                className="input" placeholder="Av. San Martín 1234" />
            </div>

            <div>
              <label className="label">Localidad</label>
              <input name="localidad" value={form.localidad} onChange={handleChange}
                className="input" placeholder="Mendoza" />
            </div>

            <div>
              <label className="label">Teléfono Principal</label>
              <input name="telefono" value={form.telefono} onChange={handleChange}
                className="input" placeholder="261 4XX-XXXX" />
            </div>

            <div>
              <label className="label">Teléfono 2</label>
              <input name="telefono1" value={form.telefono1} onChange={handleChange}
                className="input" placeholder="261 4XX-XXXX" />
            </div>

            <div>
              <label className="label">Teléfono 3</label>
              <input name="telefono2" value={form.telefono2} onChange={handleChange}
                className="input" placeholder="261 4XX-XXXX" />
            </div>

            <div>
              <label className="label">Email Principal</label>
              <input name="mail" type="email" value={form.mail} onChange={handleChange}
                className="input" placeholder="jugador@email.com" />
            </div>

            <div>
              <label className="label">Email Secundario</label>
              <input name="mail2" type="email" value={form.mail2} onChange={handleChange}
                className="input" placeholder="alternativo@email.com" />
            </div>

          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/jugadores')} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isLoading} className="btn-primary">
            <Save size={15} />
            {mutation.isLoading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear jugador'}
          </button>
        </div>

      </form>
    </div>
  )
}
