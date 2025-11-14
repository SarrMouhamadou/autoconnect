# 🚗 AutoConnect - Plateforme de Gestion de Concessions Automobiles

> Projet de mémoire de Licence 3 - Développement d'une plateforme web complète de gestion de concessions automobiles avec système de vente et de location.

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Roadmap](#roadmap)
- [Auteur](#auteur)

---

## 📖 À propos

**AutoConnect** est une plateforme web permettant la gestion complète de concessions automobiles, incluant :
- Gestion du catalogue de véhicules (vente et location)
- Système multi-utilisateurs (Clients, Concessionnaires, Administrateurs)
- Réservation et location de véhicules avec génération de contrats PDF
- Géolocalisation des concessions
- Système de demandes clients (contact, essai, devis)
- Statistiques et rapports détaillés

---

## ✨ Fonctionnalités

### 🔹 Pour les Visiteurs/Clients
- Parcourir le catalogue de véhicules
- Recherche et filtrage avancés
- Comparaison de véhicules
- Réservation de locations
- Demandes de contact, essai routier, devis
- Gestion des favoris et historique

### 🔹 Pour les Concessionnaires
- Gestion complète des véhicules (CRUD)
- Gestion des concessions
- Gestion de l'équipe
- Traitement des demandes clients
- Gestion des locations (départs/retours)
- Génération automatique de contrats PDF
- Promotions et réductions
- Statistiques et rapports détaillés
- Notifications en temps réel

### 🔹 Pour les Administrateurs
- Modération des utilisateurs
- Validation des annonces
- Configuration de la plateforme
- Statistiques globales
- Gestion du contenu éditorial
- Newsletters

---

## 🛠️ Technologies

### Backend
- **Python 3.11+**
- **Django 5.x** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL 15** - Base de données
- **Redis 7** - Cache et file de tâches
- **Celery** - Tâches asynchrones
- **JWT** - Authentification

### Frontend
- **React 18** - Interface utilisateur
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Query** - Gestion d'état serveur
- **React Hook Form** - Gestion de formulaires

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **Git** - Contrôle de version

### Autres
- **Leaflet** - Cartes interactives
- **ReportLab** - Génération PDF
- **Cloudinary** - Stockage médias

---

## 🏗️ Architecture
```
Architecture Monolithe Modulaire

┌─────────────────────────────────┐
│     Frontend (React + Vite)     │
│         Port: 5173              │
└────────────┬────────────────────┘
             │ HTTP/REST API
             │
┌────────────▼────────────────────┐
│   Backend (Django + DRF)        │
│         Port: 8000              │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │vehicules │   │
│  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐   │
│  │locations │  │ demands  │   │
│  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐   │
│  │concessions│ │statistiques│  │
│  └──────────┘  └──────────┘   │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼────┐
│PostgreSQL│      │  Redis   │
│Port: 5432│      │Port: 6379│
└──────────┘      └──────────┘
```

---

## 📦 Installation

### Prérequis

- Python 3.11+
- Node.js 18+
- Docker Desktop
- Git

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd gestion-concessions
```

### 2. Backend Django
```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer (Windows Git Bash)
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env (copier depuis .env.example)
cp .env.example .env
# Puis éditer .env avec vos valeurs

# Lancer Docker (PostgreSQL + Redis)
cd ..
docker-compose up -d

# Retour au backend
cd backend

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

Backend accessible sur : `http://localhost:8000`
Admin Django : `http://localhost:8000/admin`

### 3. Frontend React
```bash
cd frontend

# Installer les dépendances
npm install

# Créer .env.local
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

Frontend accessible sur : `http://localhost:5173`

---

## 🚀 Utilisation

### Démarrer l'environnement complet
```bash
# 1. Lancer Docker (PostgreSQL + Redis)
docker-compose up -d

# 2. Backend (terminal 1)
cd backend
source venv/bin/activate  # Windows Git Bash
python manage.py runserver

# 3. Frontend (terminal 2)
cd frontend
npm run dev
```

### Accéder à l'application

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:8000/api
- **Admin Django** : http://localhost:8000/admin

### Arrêter les services
```bash
# Arrêter Docker
docker-compose stop

# Backend : Ctrl+C
# Frontend : Ctrl+C
```

---

## 🗺️ Roadmap

### Phase 1 : Setup & Configuration ✅
- [x] Configuration Backend Django
- [x] Configuration Frontend React
- [x] Configuration Docker
- [x] Git & Documentation

### Phase 2 : Authentification & Utilisateurs 🔄
- [ ] Modèles utilisateurs
- [ ] API authentification JWT
- [ ] Pages login/register
- [ ] Gestion profil

### Phase 3 : Gestion des véhicules
- [ ] Modèles véhicules
- [ ] API CRUD véhicules
- [ ] Upload médias
- [ ] Catalogue frontend
- [ ] Détails véhicule
- [ ] Comparaison
- [ ] CRUD concessionnaire

### Phase 4 : Géolocalisation & Concessions
- [ ] Modèles concessions
- [ ] API concessions
- [ ] Carte interactive (Leaflet)
- [ ] Gestion concessions

### Phase 5 : Système de demandes
- [ ] Modèles demandes
- [ ] API demandes
- [ ] Formulaires client
- [ ] Gestion concessionnaire

### Phase 6 : Système de location
- [ ] Modèles location
- [ ] API location
- [ ] Génération PDF contrats
- [ ] Réservation client
- [ ] Gestion concessionnaire

### Phase 7 : Fonctionnalités Client
- [ ] Favoris
- [ ] Historique
- [ ] Notifications

### Phase 8 : Fonctionnalités Concessionnaire
- [ ] Gestion utilisateurs & rôles
- [ ] Promotions
- [ ] Statistiques
- [ ] Dashboard

### Phase 9 : Administration
- [ ] Gestion utilisateurs
- [ ] Modération
- [ ] Configuration
- [ ] Statistiques globales
- [ ] Communication

### Phase 10 : Tests & Déploiement
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Optimisation
- [ ] Sécurité
- [ ] Documentation
- [ ] Déploiement
- [ ] Préparation mémoire

---

## 👨‍💻 Auteur

**[Votre Nom]**
- Licence 3 - [Votre Université]
- Email : [votre.email@example.com]
- GitHub : [@votre-username]

---

## 📄 Licence

Ce projet est réalisé dans le cadre d'un mémoire de Licence 3.

---

## 📚 Documentation supplémentaire

- [Guide Docker](README-DOCKER.md)
- [API Documentation](docs/API.md) _(à venir)_
- [Guide de contribution](CONTRIBUTING.md) _(à venir)_

---

**Développé avec ❤️ dans le cadre d'un projet académique**