import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function listAllRoles() {
  console.log('\n🎭 Liste de tous les rôles dans la base de données:\n')
  console.log('='.repeat(60))
  
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: {
        select: { users: true }
      }
    }
  })
  
  if (roles.length === 0) {
    console.log('❌ Aucun rôle trouvé dans la base de données')
    return
  }
  
  roles.forEach((role, index) => {
    console.log(`\n${index + 1}. ${role.name}`)
    console.log(`   ID: ${role.id}`)
    console.log(`   Description: ${role.description || 'Aucune'}`)
    console.log(`   Système: ${role.isSystem ? 'Oui' : 'Non'}`)
    console.log(`   Permissions: ${role.permissions.length}`)
    console.log(`   Utilisateurs assignés: ${role._count.users}`)
    if (role.permissions.length > 0) {
      console.log(`   Permissions:`)
      role.permissions.forEach(p => {
        console.log(`      - ${p.name}`)
      })
    }
  })
  
  console.log('\n' + '='.repeat(60))
  console.log(`\nTOTAL: ${roles.length} rôle(s)\n`)
}

listAllRoles()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
