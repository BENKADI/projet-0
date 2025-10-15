# Projet-0

Application web complète avec backend Node.js/Express et frontend moderne.

## Structure du projet

```
projet-0/
├── backend/          # API backend Node.js + Express + Prisma
├── frontend/         # Application frontend
└── app-manager.ps1   # Script PowerShell pour gérer l'application
```

## Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- PowerShell (pour Windows)

## Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Utilisation

### Avec le script PowerShell (Windows)
```powershell
.\app-manager.ps1
```

Le script propose un menu interactif pour :
- Démarrer l'application (Backend + Frontend)
- Arrêter l'application
- Redémarrer l'application
- Démarrer Prisma Studio

### Manuellement

#### Backend
```bash
cd backend
npm run dev
```
Backend disponible sur http://localhost:3000

#### Frontend
```bash
cd frontend
npm run dev
```
Frontend disponible sur http://localhost:3001

#### Prisma Studio
```bash
cd backend
npx prisma studio
```
Interface BDD disponible sur http://localhost:5555

## Technologies

### Backend
- Node.js
- Express
- Prisma ORM
- TypeScript
- JWT pour l'authentification
- bcrypt pour le hachage des mots de passe

### Frontend
- React / Next.js (à vérifier)
- TypeScript

## Licence

ISC
