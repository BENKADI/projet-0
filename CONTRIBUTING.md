# Guide de contribution

Merci de votre intérêt pour contribuer à Projet-0 ! 🎉

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- PostgreSQL 16+
- Git

### Configuration locale

1. **Cloner le dépôt**
```bash
git clone https://github.com/BENKADI/projet-0.git
cd projet-0
```

2. **Configuration Backend**
```bash
cd backend
npm install
cp .env.example .env
# Modifier .env avec vos configurations
npx prisma generate
npx prisma migrate dev
npm run dev
```

3. **Configuration Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Modifier .env avec vos configurations
npm run dev
```

## 📝 Standards de code

### Format du code
- Utilisez Prettier pour le formatage
- Exécutez `npm run format` avant de commit

### Conventions de nommage
- **Variables/Functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case.ts

### Commits
Format des messages de commit :
```
type(scope): description courte

Description détaillée (optionnelle)
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemples :
- `feat(auth): add password reset functionality`
- `fix(api): correct user validation error`
- `docs(readme): update installation instructions`

## 🔀 Workflow Git

1. Créer une branche depuis `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-fonctionnalite
```

2. Faire vos modifications et commit

3. Pousser et créer une Pull Request vers `develop`

## 🧪 Tests

Avant de soumettre une PR :
- [ ] Le code compile sans erreur
- [ ] Prettier est passé
- [ ] Les tests passent (quand disponibles)
- [ ] La documentation est à jour

## 📚 Documentation

- Documentez les nouvelles fonctionnalités
- Ajoutez des commentaires JSDoc pour les fonctions publiques
- Mettez à jour le README si nécessaire

## ❓ Questions

Pour toute question, ouvrez une issue sur GitHub.

Merci pour votre contribution ! 🙏
