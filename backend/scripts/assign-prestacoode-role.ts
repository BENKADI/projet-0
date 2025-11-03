import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function assignPrestacoodeRole() {
  const email = 'user02@projet0.com'
  
  console.log('\n🔗 Assignation du rôle Prestacoode à:', email)
  console.log('='.repeat(60))
  
  // Trouver le rôle Prestacoode
  const role = await prisma.role.findUnique({
    where: { name: 'prestacoode' },
    include: { permissions: true }
  })
  
  if (!role) {
    console.log('❌ Le rôle "prestacoode" n\'existe pas dans la base de données')
    process.exit(1)
  }
  
  console.log(`\n✅ Rôle trouvé: ${role.name}`)
  console.log(`   Permissions: ${role.permissions.length}`)
  
  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true }
  })
  
  if (!user) {
    console.log(`❌ L'utilisateur ${email} n'existe pas`)
    process.exit(1)
  }
  
  console.log(`\n✅ Utilisateur trouvé: ${user.email}`)
  
  // Vérifier si le rôle est déjà assigné
  const hasRole = user.roles.some(r => r.id === role.id)
  
  if (hasRole) {
    console.log(`\n⚠️  Le rôle est déjà assigné à cet utilisateur`)
  } else {
    // Assigner le rôle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: {
          connect: { id: role.id }
        }
      }
    })
    
    console.log(`\n✅ Rôle assigné avec succès !`)
  }
  
  console.log('\n📊 Résumé:')
  console.log(`   Email: ${user.email}`)
  console.log(`   Rôle assigné: ${role.name}`)
  console.log(`   Permissions obtenues: ${role.permissions.length}`)
  console.log('\n   Permissions:')
  role.permissions.forEach(p => {
    console.log(`      - ${p.name}`)
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('\n💡 L\'utilisateur doit se déconnecter et se reconnecter')
  console.log('   pour que les permissions soient appliquées.\n')
}

assignPrestacoodeRole()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
