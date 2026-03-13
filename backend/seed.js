import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear tipo de persona
  const tipo = await prisma.tipoPersona.create({
    data: { nombre: 'Administrador' }
  })
  console.log('✅ Tipo persona creado:', tipo.nombre)

  // Crear usuario admin
  const hash = await bcrypt.hash('admin123', 10)
  const usuario = await prisma.usuario.create({
    data: {
      usuario:  'admin',
      password: hash,
      nombre:   'Administrador',
      tipoId:   1,
      activo:   true
    }
  })
  console.log('✅ Usuario admin creado:', usuario.usuario)
  console.log('🔑 Contraseña: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
