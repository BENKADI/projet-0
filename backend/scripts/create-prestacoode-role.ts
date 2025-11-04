import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function createPrestacoodeRole() {
  console.log('\n🎭 Création du rôle Prestacoode...\n')
  
  // Récupérer les permissions à assigner (CRUD utilisateurs)
  const permissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'create:users',
          'read:users',
          'update:users',
          'delete:users',
        ]
      }
    }
  })
  
  if (permissions.length === 0) {
    console.error('❌ Aucune permission trouvée. Exécutez d\'abord le seed.')
    process.exit(1)
  }
  
  // Créer ou mettre à jour le rôle prestacoode
  const role = await prisma.role.upsert({
    where: { name: 'prestacoode' },
    update: {
      description: 'Rôle prestataire avec gestion des utilisateurs (CRUD)',
      permissions: {
        set: permissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: 'prestacoode',
      description: 'Rôle prestataire avec gestion des utilisateurs (CRUD)',
      isSystem: false,
      permissions: {
        connect: permissions.map(p => ({ id: p.id }))
      }
    }
  })
  
  console.log('✅ Rôle Prestacoode créé avec succès !')
  console.log('='.repeat(50))
  console.log(`🎭 Nom: ${role.name}`)
  console.log(`📝 Description: ${role.description}`)
  console.log(`✨ Permissions: ${permissions.length}`)
  console.log('='.repeat(50))
  
  // Assigner le rôle aux utilisateurs avec role="prestacoode"
  const usersWithPrestacoode = await prisma.user.findMany({
    where: { role: 'prestacoode' },
    include: { roles: true }
  })
  
  for (const user of usersWithPrestacoode) {
    const hasRole = user.roles.some(r => r.id === role.id)
    if (!hasRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: role.id }
          }
        }
      })
      console.log(`✅ Rôle assigné à ${user.email}`)
    }
  }
  
  console.log('\n💡 Les utilisateurs avec ce rôle doivent se reconnecter.\n')
}

createPrestacoodeRole()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
