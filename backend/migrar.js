import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  const sql = readFileSync('./migrar_07_plantel.sql', 'utf8')
  const statements = sql.split('\n').filter(l => l.startsWith('INSERT'))
  
  console.log(`Ejecutando ${statements.length} inserts...`)
  let ok = 0, err = 0
  
  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt)
      ok++
      if (ok % 500 === 0) console.log(`  ${ok}/${statements.length}...`)
    } catch (e) {
      err++
    }
  }
  console.log(`✅ Listo: ${ok} ok, ${err} errores`)
}

main().finally(() => prisma.$disconnect())