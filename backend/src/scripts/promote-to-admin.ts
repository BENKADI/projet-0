import { PrismaClient } from '../../generated/prisma';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function promoteUserToAdmin() {
  try {
    console.log('\n🔐 Promotion d\'un utilisateur en Administrateur\n');

    // Afficher tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données.');
      process.exit(1);
    }

    console.log('📋 Utilisateurs disponibles:\n');
    users.forEach((user, index) => {
      const name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : 'N/A';
      console.log(`${index + 1}. ${user.email} (${name}) - Rôle: ${user.role}`);
    });

    // Demander quel utilisateur promouvoir
    const answer = await question('\nEntrez le numéro de l\'utilisateur à promouvoir (ou "q" pour quitter): ');

    if (answer.toLowerCase() === 'q') {
      console.log('Opération annulée.');
      process.exit(0);
    }

    const userIndex = parseInt(answer) - 1;

    if (isNaN(userIndex) || userIndex < 0 || userIndex >= users.length) {
      console.log('❌ Numéro invalide.');
      process.exit(1);
    }

    const selectedUser = users[userIndex];

    if (!selectedUser) {
      console.log('❌ Utilisateur non trouvé.');
      process.exit(1);
    }

    if (selectedUser.role === 'admin') {
      console.log(`\n✅ ${selectedUser.email} est déjà administrateur.`);
      process.exit(0);
    }

    // Confirmer
    const confirm = await question(`\n⚠️  Confirmer la promotion de ${selectedUser.email} en administrateur? (o/n): `);

    if (confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'oui') {
      console.log('Opération annulée.');
      process.exit(0);
    }

    // Promouvoir l'utilisateur
    await prisma.user.update({
      where: { id: selectedUser.id },
      data: { role: 'admin' }
    });

    console.log(`\n✅ Succès! ${selectedUser.email} est maintenant administrateur.`);
    console.log('\n💡 L\'utilisateur devra se reconnecter pour que les changements prennent effet.');

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Exécuter le script
promoteUserToAdmin();
