# 🎬 CineWise - Plateforme de Recommandation de Films

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Services](#services)
4. [Technologies](#technologies)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Documentation API](#documentation-api)
8. [Tests](#tests)
9. [Déploiement](#déploiement)
10. [Contribution](#contribution)
11. [Licence](#licence)

---

## 🔍 Vue d'ensemble

**CineWise** est une plateforme intelligente de recommandation de films basée sur une architecture microservices. Elle offre des recommandations personnalisées en fonction des préférences utilisateurs, de leur historique de visionnage et des tendances actuelles. Grâce à des algorithmes avancés et un moteur de suggestion performant, CineWise garantit une expérience utilisateur fluide et pertinente.

### 🎯 Fonctionnalités Clés

- Recommandations personnalisées
- Notation et commentaires de films
- Gestion des préférences utilisateurs
- Historique de visionnage
- Suggestions basées sur les genres
- API GraphQL flexible + REST complet
- Interface intuitive pour les utilisateurs

---

## 🏗️ Architecture
![mermaid-diagram-2025-05-12-033158](https://github.com/user-attachments/assets/d02afb13-e7b5-4db1-a21a-5c4b13c73d36)

## Flux de Communication
L'architecture de CineWise implémente plusieurs niveaux de communication entre ses composants :

### 1. Communication Client-Gateway
- HTTP/1.1 :
  - Les clients Web/Mobile communiquent avec la Gateway via HTTP/1.1
  - Deux points d'entrée principaux : REST API et GraphQL
  - Le Reverse Proxy gère le routage des requêtes
### 2. Communication Inter-Services (gRPC)
- Gateway → Services :
  - La Gateway communique avec les microservices via gRPC
  - Ports gRPC dédiés :
    - User Service : 50053
    - Movie Service : 50051
    - Recommendation Service : 50052
  - Avantages : Performance élevée, contrats stricts avec Protocol Buffers
### 3. Communication Événementielle (Kafka)
- Publication/Souscription :
  - Les services publient des événements sur Kafka
  - Exemples d'événements :
    - Nouveaux films ajoutés
    - Actions utilisateur
    - Mises à jour des recommandations
  - Communication asynchrone pour le découplage des services
### 4. Persistance des Données
- Services → MongoDB :
  - Chaque service dispose de sa propre base de données
  - Isolation des données par domaine :
    - Users DB : Données utilisateurs
    - Movies DB : Catalogue de films
    - Recommendations DB : Données de recommandation




## 🧩 Services

### 🌐 Gateway Service (Port 3000)
- Point d'entrée unique de l'application
- Gestion de l'authentification
- Routage des requêtes
- Interface GraphQL

### 👤 User Service (Port 3003)
- Gestion des comptes utilisateurs
- Authentification JWT
- Historique de visionnage
- Communication gRPC (Port 50053)

### 🎞️ Movie Service (Port 3001)
- Gestion du catalogue de films
- Recherche et filtrage
- Communication gRPC (Port 50051)

### 🤖 Recommendation Service (Port 3002)
- Génération de recommandations
- Analyse des préférences
- Communication gRPC (Port 50052)

## 🛠️ Technologies
- **Backend**: Node.js, Express
- **Base de données**: MongoDB
- **Message Broker**: Apache Kafka
- **Communication**: gRPC, REST, GraphQL
- **Conteneurisation**: Docker
- **Authentification**: JWT

## ⚙️ Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/cinewise.git

# Installer les dépendances
cd cinewise
npm install

# Lancer les services
docker-compose up -d
```

## 🔧 Configuration

### Variables d'Environnement
Chaque service nécessite ses propres variables d'environnement :

```env
# Gateway Service
NODE_ENV=production
USER_SERVICE_URL=http://user-service:3003
MOVIE_SERVICE_URL=http://movie-service:3001
RECOMMENDATION_SERVICE_URL=http://recommendation-service:3002

# User Service
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-users
JWT_SECRET=your_jwt_secret_key
KAFKA_BROKER=kafka:9092

# Movie Service
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-movies
KAFKA_BROKERS=kafka:9092

# Recommendation Service
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-recommendations
MOVIE_SERVICE_URL=http://movie-service:3001
KAFKA_BROKERS=kafka:9092
```

## 📘 API Documentation

### Endpoints REST

#### Users
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/preferences` - Mise à jour des préférences
  ![register](https://github.com/user-attachments/assets/0e888a89-7105-49fd-9e08-4ccdc270bc5d)

![login](https://github.com/user-attachments/assets/e8ed508f-154a-4260-b4dc-d6e04c1dde54)

  

#### Movies
- `GET /api/movies` - Liste des films
- `GET /api/movies/:id` - Détails d'un film
- `POST /api/movies` - Ajout d'un film (Admin)
- `PUT /api/movies/:id` - Modification d'un film (Admin)

#### Recommendations
- `GET /api/recommendations` - Recommandations personnalisées
- `GET /api/recommendations/trending` - Films tendance

### Endpoints gRPC
- User Service (50053) - Gestion des événements utilisateur
- Movie Service (50051) - Gestion du catalogue
- Recommendation Service (50052) - Calcul des recommandations

## 🧪 Tests

## Sécurité
- Authentification JWT
- Rate Limiting
- Validation des données
- CORS configuré
- Réseau Docker isolé

## 🚀 Déploiement
Le projet utilise Docker et Docker Compose pour le déploiement :

```bash
# Production
docker-compose -f docker-compose.yml up -d

# Développement
docker-compose -f docker-compose.dev.yml up
```

### 📈 Monitoring
- Interface Mongo Express (Port 8081)
- Logs centralisés
- Healthchecks pour chaque service

### ⚖️ Scalabilité
- Services indépendants
- Communication asynchrone via Kafka
- Architecture permettant le scaling horizontal


      
