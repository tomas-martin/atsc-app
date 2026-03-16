import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, User, Camera, X } from 'lucide-react'
import { personaService } from '../services/api'
import toast from 'react-hot-toast'

const GRUPOS_SANGRE = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const SUPABASE_URL = 'https://ssgfsbaqabjkwzhqsiux.supabase.co'

export default function JugadorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    apellido: '', nombre: '', alias: '', documento: '',
    nroCarnet: '', fechaNac: '', domicilio: '', localidad: '',
    grupo: '', obraSocial: '', telefono: '', telefono1: '', telefono2: '',
    mail: '', mail2: '', nroSocio: '', estado: true, foto: '',
  })
  const [fotoPreview, setFotoPreview]   = useState(null)
  const [fotoFile, setFotoFile]         = useState(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

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
        foto:       persona.foto       || '',
      })
      if (persona.foto) setFotoPreview(persona.foto)
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
    onError: (err) => toast.error(err.response?.data?.message || 'Error al guardar')
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La foto no puede superar 5MB')
      return
    }
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const subirFoto = async (file, personaId) => {
    const ext  = file.name.split('.').pop()
    const path = `${personaId}.${ext}`
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/jugadores/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      }
    )
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    return `${SUPABASE_URL}/storage/v1/object/public/jugadores/${path}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.apellido.trim() || !form.nombre.trim()) {
      toast.error('Apellido y nombre son obligatorios')
      return
    }

    let fotoUrl = form.foto

    if (fotoFile && id) {
      setSubiendoFoto(true)
      try {
        fotoUrl = await subirFoto(fotoFile, id)
      } catch (err) {
        console.error(err)
        toast.error('Error al subir la foto')
        setSubiendoFoto(false)
        return
      }
      setSubiendoFoto(false)
    }

    const data = { ...form, foto: fotoUrl }
    if (data.nroSocio === '') data.nroSocio = null
    mutation.mutate(data)
  }

  const quitarFoto = () => {
    setFotoFile(null)
    setFotoPreview(null)
    setForm(f => ({ ...f, foto: '' }))
  }

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-atsc-gris-claro border-t-atsc-azul-claro rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-[900px] mx-auto px-8 py-7">

      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => navigate('/jugadores')} className="btn-ghost px-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-condensed text-3xl font-black text-atsc-azul-oscuro uppercase tracking-wide">
            {esEdicion ? 'Editar Jugador' : 'Nuevo Jugador'}
          </h1>
          <p className="text-sm text-atsc-gris-texto mt-0.5">
            {esEdicion
              ? `Modificando datos de ${persona?.apellido}, ${persona?.nombre}`
              : 'Completá los datos del nuevo jugador'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Foto */}
        <div className="card mb-5">
          <div className="card-header">
            <span className="card-title flex items-center gap-2">
              <Camera size={14} /> Foto del jugador
            </span>
          </div>
          <div className="p-5 flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-atsc-azul-claro to-atsc-azul-oscuro flex items-center justify-center flex-shrink-0">
              {fotoPreview ? (
                <>
                  <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={quitarFoto}
                    className="absolute top-0 right-0 w-6 h-6 bg-atsc-rojo rounded-full flex items-center justify-center"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </>
              ) : (
                <span className="text-white font-condensed font-black text-3xl">
                  {form.apellido ? form.apellido[0] : <User size={32} />}
                </span>
              )}
            </div>
            <div>
              <label className="btn-outline cursor-pointer inline-flex items-center gap-2 px-4 py-2">
                <Camera size={14} />
                {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-atsc-gris-texto mt-2">JPG, PNG o WebP. Máximo 5MB.</p>
              {!esEdicion && fotoFile && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ La foto se sube al guardar el jugador por primera vez
                </p>
              )}
            </div>
          </div>
        </div>

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
                className="input" />
            </div>
            <div>
              <label className="label">Teléfono 3</label>
              <input name="telefono2" value={form.telefono2} onChange={handleChange}
                className="input" />
            </div>
            <div>
              <label className="label">Email Principal</label>
              <input name="mail" type="email" value={form.mail} onChange={handleChange}
                className="input" placeholder="jugador@email.com" />
            </div>
            <div>
              <label className="label">Email Secundario</label>
              <input name="mail2" type="email" value={form.mail2} onChange={handleChange}
                className="input" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/jugadores')} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={mutation.isLoading || subiendoFoto} className="btn-primary">
            <Save size={15} />
            {subiendoFoto ? 'Subiendo foto...' : mutation.isLoading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear jugador'}
          </button>
        </div>

      </form>
    </div>
  )
}
