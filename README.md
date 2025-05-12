# CineWise - Plateforme de Recommandation de Films

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Services](#services)
4. [Technologies](#technologies)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [API Documentation](#api-documentation)
8. [Tests](#tests)
9. [Déploiement](#déploiement)

## Vue d'ensemble

CineWise est une plateforme moderne de recommandation de films construite sur une architecture microservices. Le système offre des recommandations personnalisées basées sur les préférences utilisateurs, l'historique de visionnage et les tendances actuelles. Notre plateforme utilise des algorithmes avancés pour fournir des suggestions pertinentes et maintenir une expérience utilisateur optimale.

### Fonctionnalités Principales

* Recommandations personnalisées de films
* Système de notation et commentaires
* Gestion des préférences utilisateur
* Historique de visionnage
* Suggestions basées sur les genres
* Interface GraphQL flexible
* API REST complète

## Architecture

Notre application suit une architecture microservices moderne et scalable :

```plaintext
cinewise-backend/
├── gateway/                  # Service de passerelle API (GraphQL + REST)
├── user-service/            # Gestion des utilisateurs et authentification
├── movie-service/           # Catalogue et gestion des films
├── recommendation-service/  # Moteur de recommandation intelligent
├── database/                # Configuration MongoDB et scripts
├── kafka/                   # Configuration Kafka et topics
└── docker-compose.yml       # Orchestration des services
```

### Flux de Communication

1. Le client interagit avec le Gateway Service
2. Le Gateway route les requêtes vers les services appropriés
3. Les services communiquent entre eux via gRPC
4. Kafka gère les événements asynchrones
5. MongoDB stocke les données de chaque service

## Services

### Gateway Service (Port 3000)

* Point d'entrée unique (API Gateway Pattern)
* Interface GraphQL avec playground
* Authentification et autorisation
* Load balancing et rate limiting
* Documentation Swagger/OpenAPI
* Logging et monitoring

### User Service (Port 3003)

* Inscription et authentification
* Gestion des profils
* Préférences de visionnage
* Historique d'activité
* Communication gRPC (Port 50053)
* Événements Kafka pour l'activité utilisateur

### Movie Service (Port 3001)

* CRUD des films
* Système de recherche avancé
* Filtrage multi-critères
* Gestion des métadonnées
* Communication gRPC (Port 50051)
* Cache Redis pour les performances

### Recommendation Service (Port 3002)

* Algorithmes de recommandation personnalisés
* Analyse des tendances
* Traitement des événements Kafka
* Machine Learning pour les suggestions
* Communication gRPC (Port 50052)
* Mise à jour en temps réel

## Technologies

### Backend

* Runtime : Node.js 18+
* Framework : Express.js
* API : GraphQL (Apollo Server), REST
* Types : TypeScript
* Tests : Jest, Supertest

### Base de données

* Principale : MongoDB
* Cache : Redis
* Événements : Apache Kafka

### Communication

* Inter-services : gRPC
* API : GraphQL, REST
* Messages : Apache Kafka
* Protocoles : Protocol Buffers

### Déploiement

* Conteneurisation : Docker
* Orchestration : Docker Compose
* CI/CD : GitHub Actions
* Monitoring : Prometheus, Grafana

### Sécurité

* Authentification : JWT
* API : Rate Limiting, CORS
* Données : Validation, Sanitization
* Réseau : Docker Networks

## Installation

### Prérequis

* Docker et Docker Compose
* Node.js (v18 ou supérieur)
* npm ou yarn
* Git

### Étapes d'installation

```bash
# Cloner le repository
git clone https://github.com/RaefGaied/CineWise.git

# Installer les dépendances
cd cinewise
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Lancer les services
docker-compose up -d
```

## Configuration

### Variables d'Environnement

Chaque service nécessite sa propre configuration :

```env
# Gateway Service
NODE_ENV=production
PORT=3000
JWT_SECRET=votre_secret_jwt
USER_SERVICE_URL=http://user-service:3003
MOVIE_SERVICE_URL=http://movie-service:3001
RECOMMENDATION_SERVICE_URL=http://recommendation-service:3002
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# User Service
PORT=3003
GRPC_PORT=50053
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-users
JWT_SECRET=votre_secret_jwt
KAFKA_BROKERS=kafka:9092
REDIS_URL=redis://redis:6379

# Movie Service
PORT=3001
GRPC_PORT=50051
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-movies
KAFKA_BROKERS=kafka:9092
REDIS_URL=redis://redis:6379

# Recommendation Service
PORT=3002
GRPC_PORT=50052
MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-recommendations
KAFKA_BROKERS=kafka:9092
REDIS_URL=redis://redis:6379
```

## API Documentation

### GraphQL API

Accessible via `/graphql` avec playground intégré.

#### Principales Queries

```graphql
# Recherche de films
query SearchMovies($query: String!) {
  searchMovies(query: $query) {
    id
    title
    genre
    rating
  }
}

# Recommandations personnalisées
query GetRecommendations {
  recommendations {
    id
    title
    genre
    rating
  }
}
```

### REST API

#### Authentification

* POST `/api/auth/register` - Inscription
* POST `/api/auth/login` - Connexion
* GET `/api/auth/refresh` - Rafraîchir le token
* POST `/api/auth/logout` - Déconnexion

#### Utilisateurs

* GET `/api/users/profile` - Profil utilisateur
* PUT `/api/users/preferences` - Mise à jour des préférences
* GET `/api/users/history` - Historique de visionnage
* GET `/api/users/watchlist` - Liste de films à voir

#### Films

* GET `/api/movies` - Liste des films
* GET `/api/movies/:id` - Détails d'un film
* POST `/api/movies` - Ajout d'un film (Admin)
* PUT `/api/movies/:id` - Modification d'un film (Admin)
* DELETE `/api/movies/:id` - Suppression d'un film (Admin)

#### Recommandations

* GET `/api/recommendations` - Recommandations personnalisées
* GET `/api/recommendations/trending` - Films tendance
* GET `/api/recommendations/genre/:genre` - Par genre
* GET `/api/recommendations/similar/:movieId` - Films similaires

## Tests

```bash
# Exécuter tous les tests
npm test

# Tests d'un service spécifique
cd service-name && npm test

# Tests avec couverture
npm run test:coverage
```

## Déploiement

### Production

```bash
# Déploiement production
docker-compose -f docker-compose.yml up -d

# Scaling d'un service
docker-compose up -d --scale movie-service=3
```

### Développement

```bash
# Environnement de développement
docker-compose -f docker-compose.dev.yml up

# Hot reload activé
npm run dev
```

### Monitoring

* Mongo Express: [http://localhost:8081](http://localhost:8081)
* Grafana: [http://localhost:3000](http://localhost:3000)
* Prometheus: [http://localhost:9090](http://localhost:9090)
* Kafka UI: [http://localhost:8080](http://localhost:8080)

### Logs

* Logs centralisés avec ELK Stack
* Traces distribuées avec Jaeger
* Métriques avec Prometheus

### Scalabilité

* Services indépendants et stateless
* Communication asynchrone via Kafka
* Cache distribué avec Redis
* Load balancing automatique
* Réplication MongoDB

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
