# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2025-10-15

### Ajouté

#### Backend
- ✨ Configuration complète Express.js avec TypeScript
- ✨ Intégration Prisma ORM avec PostgreSQL
- ✨ Système d'authentification JWT complet
- ✨ Gestion granulaire des permissions
- ✨ Validation des données avec Zod
- ✨ Documentation API Swagger/OpenAPI
- ✨ Logging professionnel avec Winston (rotation quotidienne)
- ✨ Middlewares de sécurité (Helmet, Rate Limiting)
- ✨ Gestion centralisée des erreurs
- ✨ Health checks (liveness, readiness)
- ✨ Support CORS configurable
- ✨ Graceful shutdown

#### Frontend
- ✨ Application React 19 avec TypeScript
- ✨ Build ultra-rapide avec Vite
- ✨ Styling avec TailwindCSS
- ✨ Composants UI accessibles (Radix UI)
- ✨ Routing avec React Router DOM
- ✨ Gestion d'état avec Context API
- ✨ Client HTTP Axios configuré
- ✨ Support du thème clair/sombre
- ✨ Layout responsive et moderne

#### DevOps
- ✨ Configuration Docker complète (Backend, Frontend, PostgreSQL)
- ✨ Docker Compose pour développement
- ✨ Dockerfiles optimisés multi-stage
- ✨ Configuration Nginx pour le frontend
- ✨ GitHub Actions CI/CD
- ✨ Workflow de qualité de code
- ✨ Prettier et ESLint configurés
- ✨ EditorConfig pour la cohérence
- ✨ Makefile avec commandes utilitaires
- ✨ Script PowerShell de gestion (Windows)

#### Documentation
- ✨ README complet et détaillé
- ✨ Guide de contribution (CONTRIBUTING.md)
- ✨ Fichiers .env.example
- ✨ Documentation API interactive
- ✨ Commentaires de code
- ✨ Structure de projet claire

#### Configuration
- ✨ TypeScript strict mode
- ✨ ESLint pour le code quality
- ✨ Prettier pour le formatage
- ✨ Git hooks (optionnel)
- ✨ Variables d'environnement

### Sécurité
- 🔒 Headers HTTP sécurisés avec Helmet
- 🔒 Protection rate limiting
- 🔒 CORS strictement configuré
- 🔒 Validation des entrées utilisateur
- 🔒 Hachage sécurisé des mots de passe (bcrypt)
- 🔒 JWT pour l'authentification
- 🔒 Gestion des erreurs sans fuite d'informations

[1.0.0]: https://github.com/BENKADI/projet-0/releases/tag/v1.0.0
