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
  
  // 2. Créer les rôles par défaut
  console.log('🎭 Création des rôles par défaut...')
  const allPermissions = await prisma.permission.findMany()
  
  // Rôle Administrateur - Toutes les permissions
  await prisma.role.upsert({
    where: { name: 'Administrateur' },
    update: {
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: {
        set: allPermissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      isSystem: true,
      permissions: {
        connect: allPermissions.map(p => ({ id: p.id }))
      }
    }
  })
  
  // Rôle Manager - Permissions avancées
  const managerPermissions = allPermissions.filter(p => 
    p.name.startsWith('read:') || 
    p.name.startsWith('create:') || 
    p.name.startsWith('update:') ||
    p.name.includes('profile') || 
    p.name.includes('settings')
  )
  await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {
      description: 'Gestion avancée des utilisateurs et des commandes',
      permissions: {
        set: managerPermissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: 'Manager',
      description: 'Gestion avancée des utilisateurs et des commandes',
      isSystem: true,
      permissions: {
        connect: managerPermissions.map(p => ({ id: p.id }))
      }
    }
  })
  
  // Rôle Utilisateur - Permissions standard
  const userPermissions = allPermissions.filter(p => 
    p.name.startsWith('read:') || 
    p.name.includes('profile') || 
    p.name.includes('settings')
  )
  await prisma.role.upsert({
    where: { name: 'Utilisateur' },
    update: {
      description: 'Accès standard aux fonctionnalités principales',
      permissions: {
        set: userPermissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: 'Utilisateur',
      description: 'Accès standard aux fonctionnalités principales',
      isSystem: true,
      permissions: {
        connect: userPermissions.map(p => ({ id: p.id }))
      }
    }
  })
  
  // Rôle Lecteur - Lecture seule
  const viewerPermissions = allPermissions.filter(p => p.name.startsWith('read:'))
  await prisma.role.upsert({
    where: { name: 'Lecteur' },
    update: {
      description: 'Accès en lecture seule aux modules principaux',
      permissions: {
        set: viewerPermissions.map(p => ({ id: p.id }))
      }
    },
    create: {
      name: 'Lecteur',
      description: 'Accès en lecture seule aux modules principaux',
      isSystem: true,
      permissions: {
        connect: viewerPermissions.map(p => ({ id: p.id }))
      }
    }
  })
  
  console.log('✅ 4 rôles système créés\n')
  
  // 3. Vérification de l'administrateur
  console.log('👤 Vérification de l\'administrateur...')
  
  // Récupérer le rôle Administrateur
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Administrateur' }
  })
  
  if (!adminRole) {
    throw new Error('Le rôle Administrateur doit exister avant de créer l\'utilisateur admin')
  }
  
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@projet0.com' },
    include: { 
      permissions: true,
      roles: true
    }
  })

  if (!adminUser) {
    // Créer l'administrateur avec le rôle Administrateur
    const hashedPassword = await hashPassword('Admin123!')
    
    await prisma.user.create({
      data: {
        email: 'admin@projet0.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin',
        roles: {
          connect: { id: adminRole.id }
        },
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
    console.log('🛡️  Rôle: admin + Rôle Administrateur')
    console.log(`✨ Permissions: ${allPermissions.length}`)
    console.log('='.repeat(50))
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n')
  } else {
    // Mettre à jour l'admin existant
    const existingPermissionsIds = adminUser.permissions.map(p => p.id)
    const missingPermissions = allPermissions.filter(p => !existingPermissionsIds.includes(p.id))
    
    const hasAdminRole = adminUser.roles.some(r => r.id === adminRole.id)
    
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        ...(missingPermissions.length > 0 && {
          permissions: {
            connect: missingPermissions.map(p => ({ id: p.id }))
          }
        }),
        ...(!hasAdminRole && {
          roles: {
            connect: { id: adminRole.id }
          }
        })
      }
    })
    
    const updates = []
    if (missingPermissions.length > 0) {
      updates.push(`${missingPermissions.length} nouvelles permissions`)
    }
    if (!hasAdminRole) {
      updates.push('rôle Administrateur assigné')
    }
    
    if (updates.length > 0) {
      console.log(`Administrateur existant mis à jour : ${updates.join(', ')}.`)
    } else {
      console.log('L\'administrateur existant possède déjà toutes les permissions et rôles.')
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
