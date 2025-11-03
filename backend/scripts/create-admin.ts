import { PrismaClient } from '../generated/prisma'
import { hashPassword } from '../src/utils/authUtils'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'admin02@projet0.com'
  
  console.log(`\n🔧 Mise à niveau de ${email} vers Administrateur...\n`)
  
  // Récupérer le rôle Administrateur
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Administrateur' },
    include: { permissions: true }
  })
  
  if (!adminRole) {
    console.error('❌ Le rôle Administrateur n\'existe pas. Exécutez d\'abord le seed.')
    process.exit(1)
  }
  
  // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true, permissions: true }
  })
  
  if (!user) {
    console.error(`❌ L'utilisateur ${email} n'existe pas.`)
    process.exit(1)
  }
  
  // Assigner le rôle Administrateur et toutes ses permissions
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'admin',
      roles: {
        connect: { id: adminRole.id }
      },
      permissions: {
        connect: adminRole.permissions.map(p => ({ id: p.id }))
      }
    }
  })
  
  console.log('✅ Utilisateur mis à niveau vers Administrateur !')
  console.log('='.repeat(50))
  console.log(`📧 Email: ${email}`)
  console.log(`🛡️  Rôle: Administrateur`)
  console.log(`✨ Permissions: ${adminRole.permissions.length}`)
  console.log('='.repeat(50))
  console.log('\n💡 Déconnectez-vous et reconnectez-vous pour appliquer les changements.\n')
}

createAdmin()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
