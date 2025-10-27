import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function quickPromote() {
  try {
    // Promouvoir l'utilisateur ID 3 (user@projet0.com)
    const user = await prisma.user.update({
      where: { id: 3 },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('\n✅ Promotion réussie!');
    console.log('📧 Email:', user.email);
    console.log('👤 Nom:', user.firstName, user.lastName);
    console.log('🎭 Nouveau rôle:', user.role);
    console.log('\n💡 Veuillez vous reconnecter dans le frontend pour obtenir un nouveau token.\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la promotion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

quickPromote();
