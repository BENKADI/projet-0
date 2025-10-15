# Makefile pour Projet-0

.PHONY: help install dev build clean docker-up docker-down test format lint

help: ## Afficher l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installer toutes les dépendances
	@echo "📦 Installation des dépendances..."
	cd backend && npm install
	cd frontend && npm install
	@echo "✅ Installation terminée"

dev: ## Démarrer l'environnement de développement
	@echo "🚀 Démarrage de l'environnement de développement..."
	docker-compose up -d postgres
	@sleep 3
	cd backend && npx prisma migrate dev && npm run dev &
	cd frontend && npm run dev

build: ## Build les applications
	@echo "🔨 Build des applications..."
	cd backend && npm run build
	cd frontend && npm run build
	@echo "✅ Build terminé"

clean: ## Nettoyer les fichiers générés
	@echo "🧹 Nettoyage..."
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/dist frontend/node_modules
	rm -rf backend/logs
	@echo "✅ Nettoyage terminé"

docker-up: ## Démarrer avec Docker Compose
	@echo "🐳 Démarrage des conteneurs Docker..."
	docker-compose up -d
	@echo "✅ Conteneurs démarrés"

docker-down: ## Arrêter Docker Compose
	@echo "🛑 Arrêt des conteneurs Docker..."
	docker-compose down
	@echo "✅ Conteneurs arrêtés"

docker-logs: ## Voir les logs Docker
	docker-compose logs -f

format: ## Formater le code
	@echo "✨ Formatage du code..."
	cd backend && npm run format
	cd frontend && npm run format || true
	@echo "✅ Formatage terminé"

lint: ## Vérifier le code
	@echo "🔍 Vérification du code..."
	cd backend && npm run lint
	cd frontend && npm run lint
	@echo "✅ Vérification terminée"

prisma-generate: ## Générer Prisma Client
	cd backend && npx prisma generate

prisma-migrate: ## Exécuter les migrations Prisma
	cd backend && npx prisma migrate dev

prisma-studio: ## Ouvrir Prisma Studio
	cd backend && npx prisma studio

setup: install ## Configuration initiale du projet
	@echo "⚙️  Configuration initiale..."
	cp backend/.env.example backend/.env || true
	cp frontend/.env.example frontend/.env || true
	@echo "✅ Projet configuré - Veuillez modifier les fichiers .env"

.DEFAULT_GOAL := help
