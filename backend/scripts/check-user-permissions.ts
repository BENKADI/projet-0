import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function checkUserPermissions() {
  const email = 'user02@projet0.com'
  
  console.log('\n🔍 Vérification des permissions pour:', email)
  console.log('='.repeat(60))
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      permissions: true,
      roles: {
        include: {
          permissions: true
        }
      }
    }
  })
  
  if (!user) {
    console.log('❌ Utilisateur non trouvé')
    return
  }
  
  console.log('\n👤 Informations Utilisateur:')
  console.log('   Email:', user.email)
  console.log('   Nom:', `${user.firstName} ${user.lastName}`)
  console.log('   Rôle (champ string):', user.role)
  console.log('   ID:', user.id)
  
  console.log('\n🎭 Rôles Assignés (relation many-to-many):')
  if (user.roles.length === 0) {
    console.log('   ❌ AUCUN rôle assigné dans la relation User-Role')
    console.log('   ⚠️  C\'est pourquoi l\'utilisateur n\'a aucune permission !')
  } else {
    user.roles.forEach(role => {
      console.log(`   ✅ ${role.name}`)
      console.log(`      - Description: ${role.description}`)
      console.log(`      - Système: ${role.isSystem ? 'Oui' : 'Non'}`)
      console.log(`      - Permissions: ${role.permissions.length}`)
    })
  }
  
  console.log('\n🔑 Permissions Directes (assignées à l\'utilisateur):')
  if (user.permissions.length === 0) {
    console.log('   ❌ Aucune permission directe')
  } else {
    user.permissions.forEach(perm => {
      console.log(`   ✅ ${perm.name} - ${perm.description}`)
    })
  }
  
  console.log('\n🔑 Permissions via Rôles:')
  const rolePermissions = user.roles.flatMap(r => r.permissions)
  if (rolePermissions.length === 0) {
    console.log('   ❌ Aucune permission via les rôles')
  } else {
    const uniquePerms = Array.from(
      new Map(rolePermissions.map(p => [p.name, p])).values()
    )
    uniquePerms.forEach(perm => {
      console.log(`   ✅ ${perm.name} - ${perm.description}`)
    })
  }
  
  // Total des permissions
  const allPermissions = [...user.permissions, ...rolePermissions]
  const totalUniquePermissions = Array.from(
    new Map(allPermissions.map(p => [p.name, p])).values()
  )
  
  console.log('\n📊 RÉSUMÉ:')
  console.log('   Rôles assignés:', user.roles.length)
  console.log('   Permissions directes:', user.permissions.length)
  console.log('   Permissions via rôles:', rolePermissions.length)
  console.log('   TOTAL permissions uniques:', totalUniquePermissions.length)
  
  if (totalUniquePermissions.length === 0) {
    console.log('\n❌ PROBLÈME: L\'utilisateur n\'a AUCUNE permission !')
    console.log('   Solution 1: Exécutez: npx ts-node scripts/create-prestacoode-role.ts')
    console.log('   Solution 2: Assignez un rôle via l\'interface admin')
    console.log('   Solution 3: Donnez-lui le rôle Administrateur via l\'interface')
  } else {
    console.log('\n✅ L\'utilisateur a des permissions et peut accéder aux fonctionnalités correspondantes')
  }
  
  console.log('\n' + '='.repeat(60))
}

checkUserPermissions()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
