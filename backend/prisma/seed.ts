import { PrismaClient } from '../generated/prisma'
import { hashPassword } from '../src/utils/authUtils'
import { PERMISSION_DEFINITIONS } from '../src/shared/constants/permissions'

const prisma = new PrismaClient()

// Note: Les ressources ont été retirées car elles ne sont pas définies dans le schéma Prisma actuel

async function main() {
  console.log('\n🌱 Initialisation de la base de données...\n')
  
  // 1. Créer les permissions par défaut
  console.log('📝 Création des permissions par défaut...')
  for (const permission of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission
    })
  }
  
  // Note: La création des ressources a été retirée car le modèle resource n'existe pas dans le schéma Prisma actuel
  
  console.log(`✅ ${PERMISSION_DEFINITIONS.length} permissions créées\n`)
  
  // 3. Récupérer toutes les permissions
  const allPermissions = await prisma.permission.findMany()
  console.log('👤 Vérification de l\'administrateur...')
  
  // 4. Vérifier si un admin existe déjà
  const adminUser = await prisma.user.findFirst({
    where: {
      role: 'admin'
    },
    include: {
      permissions: true
    }
  })
  
  if (!adminUser) {
    // Hasher le mot de passe en utilisant la fonction hashPassword
    const hashedPassword = await hashPassword('Admin123!')
    
    // Créer l'administrateur avec toutes les permissions
    await prisma.user.create({
      data: {
        email: 'admin@projet0.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Super',
        lastName: 'Admin',
        permissions: {
          connect: allPermissions.map(p => ({ id: p.id }))
        }
      }
    })
    
    console.log('\n✅ ADMINISTRATEUR CRÉÉ AVEC SUCCÈS!')
    console.log('='.repeat(50))
    console.log('📧 Email: admin@projet0.com')
    console.log('🔑 Mot de passe: Admin123!')
    console.log('👤 Nom: Super Admin')
    console.log('🛡️  Rôle: admin')
    console.log(`✨ Permissions: ${allPermissions.length}`)
    console.log('='.repeat(50))
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n')
  } else {
    // Mettre à jour l'admin existant pour ajouter des permissions manquantes
    const existingPermissionsIds = adminUser.permissions.map(p => p.id)
    const missingPermissions = allPermissions.filter(p => !existingPermissionsIds.includes(p.id))
    
    if (missingPermissions.length > 0) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          permissions: {
            connect: missingPermissions.map(p => ({ id: p.id }))
          }
        }
      })
      console.log(`Administrateur existant mis à jour avec ${missingPermissions.length} nouvelles permissions.`)
    } else {
      console.log('L\'administrateur existant possède déjà toutes les permissions.')
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
