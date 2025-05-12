<p align="center">
  <img src="https://github.com/user-attachments/assets/a2591259-f7bd-4f8d-bd06-fe978e7bdfb5" alt="CineWise Logo" width="100"/>
</p>

<h1 align="center">🎬 CineWise - Plateforme de Recommandation de Films</h1>

## 📚 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
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

![mermaid-diagram-2025-05-12-033158](https://github.com/user-attachments/assets/a5b473b6-eae7-4a39-900b-b0d7854a0259)


## 🔄 Flux de Communication

L'architecture de CineWise implémente plusieurs niveaux de communication entre ses composants :

---

### 1. 📡 Communication Client-Gateway
- **HTTP/1.1** :
  - Les clients Web/Mobile communiquent avec la Gateway via HTTP/1.1  
  - Deux points d'entrée principaux : REST API et GraphQL  
  - Le Reverse Proxy gère le routage des requêtes  

---

### 2. 🔁 Communication Inter-Services (gRPC)
- **Gateway → Services** :
  - La Gateway communique avec les microservices via gRPC  
  - **Ports gRPC dédiés** :
    - User Service : 50053  
    - Movie Service : 50051  
    - Recommendation Service : 50052  
  - **Avantages** : Performance élevée, contrats stricts avec Protocol Buffers  

<img src="https://github.com/user-attachments/assets/d9f392cf-4553-4b7c-9fb9-d6044fb25122" alt="Gateway vers Movies" width="500"/>

---

### 3. 📬 Communication Événementielle (Kafka)
- **Publication/Souscription** :
  - Les services publient des événements sur Kafka  
  - **Exemples d'événements** :
    - Nouveaux films ajoutés  
    - Actions utilisateur  
    - Mises à jour des recommandations  
  - Communication asynchrone pour le découplage des services  

---

### 4. 🗄️ Persistance des Données
- **Services → MongoDB** :
  - Chaque service dispose de sa propre base de données  
  - Isolation des données par domaine :
    - **Users DB** : Données utilisateurs  
    - **Movies DB** : Catalogue de films  
    - **Recommendations DB** : Données de recommandation  




## 🧩 Services

### 🌐 Gateway Service (Port 3000)
- Point d'entrée unique de l'application
- Gestion de l'authentification
- Routage des requêtes
- Interface GraphQL
  <img src="https://github.com/user-attachments/assets/a84f5501-7755-4487-8bbb-f5e28afe3c19" alt="GraphQL Interface" width="400"/>

  

### 👤 User Service (Port 3003)
- Gestion des comptes utilisateurs
- Authentification JWT
- Historique de visionnage
- Communication gRPC (Port 50053)
  <img src="https://github.com/user-attachments/assets/39088aae-e7dc-426c-ba2f-f8ecb17337e9" alt="Emit User Event" width="400"/>



### 🎞️ Movie Service (Port 3001)
- Gestion du catalogue de films
- Recherche et filtrage
- Communication gRPC (Port 50051)

### 🤖 Recommendation Service (Port 3002)
- Génération de recommandations
- Analyse des préférences
- Communication gRPC (Port 50052)
 <img src="https://github.com/user-attachments/assets/3aab5be8-ecbc-4672-90d4-40b3599641b7" alt="Process Movie Event" width="400"/>



## 🛠️ Technologies
- **Backend**: Node.js, Express
- **Base de données**: MongoDB
- **Message Broker**: Apache Kafka
- **Communication**: gRPC, REST, GraphQL
- **Conteneurisation**: Docker
- **Authentification**: JWT

## ⚙️ Installation

bash
# Cloner le repository
git clone https://github.com/votre-user## 🛠️ Technologies

- **Backend**: Node.js, Express  
- **Base de données**: MongoDB  
- **Message Broker**: Apache Kafka  
- **Communication**: gRPC, REST, GraphQL  
- **Conteneurisation**: Docker  
- **Authentification**: JWT  

---
## ⚙️ Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/cinewise.git

# Aller dans le dossier du projet
cd cinewise

# Installer les dépendances
npm install

# Lancer les services avec Docker
docker-compose up -d
```


## 🔧 Configuration

### Variables d'Environnement

Chaque service nécessite ses propres variables d'environnement. Voici un exemple de fichier `.env` :

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

---

### 🧑‍💼 Endpoints REST - Utilisateurs

- POST /api/auth/register - Inscription  
  <img src="https://github.com/user-attachments/assets/0e888a89-7105-49fd-9e08-4ccdc270bc5d" alt="register" width="400"/>

- POST /api/auth/login - Connexion  
  <img src="https://github.com/user-attachments/assets/e8ed508f-154a-4260-b4dc-d6e04c1dde54" alt="login" width="400"/>

- GET /api/users/profile - Profil utilisateur  
- PUT /api/users/preferences - Mise à jour des préférences  

---

### 🎬 Endpoints REST - Films

- GET /api/movies – Liste des films  
- GET /api/movies/:id – Détails d'un film  
- POST /api/movies – Ajout d'un film (Admin)  
  <br/>
  <img src="https://github.com/user-attachments/assets/d550dbcc-cda9-4e01-8d55-ad5b3ca7d703" alt="POST Movie" width="500"/>

- PUT /api/movies/:id – Modification d'un film (Admin)  

---

### 🤖 Endpoints gRPC

- **User Service** (port 50053) – Gestion des événements utilisateur  
- **Movie Service** (port 50051) – Gestion du catalogue  
- **Recommendation Service** (port 50052) – Calcul des recommandations

---

### 📡 GraphQL

Disponible à l’URL : http://localhost:3000/graphql  

<img src="https://github.com/user-attachments/assets/27e62764-1a48-4ef9-bd70-94d2c56076cb" alt="GraphQL UI" width="400"/>

#### 🔐 Connexion via GraphQL

graphql
mutation {
  login(input: { email: "user@example.com", password: "password123" }) {
    accessToken
    user {
      id
      email
    }
  }
}

### 🛰️ Endpoints gRPC

- **User Service** (50053) – Gestion des événements utilisateur  
- **Movie Service** (50051) – Gestion du catalogue  
  <br/>
  <strong>Exemple d'appel gRPC pour Movie :</strong><br/>
  <img src="https://github.com/user-attachments/assets/8b8eb361-b150-4bce-9bbe-ebd491a09072" alt="gRPC Movie Example" width="500"/>

- **Recommendation Service** (50052) – Calcul des recommandations  

---

## 🧪 Tests

Tests automatisés pour les endpoints sécurisés (authentification requise avant création de film) :

<img src="https://github.com/user-attachments/assets/bf063b92-b9c8-4c18-9e2a-051067590517" alt="Test Auth Movie" width="500"/>

## Sécurité
- Authentification JWT
- Rate Limiting
- Validation des données
- CORS configuré
- Réseau Docker isolé

## 🚀 Déploiement
Le projet utilise Docker et Docker Compose pour le déploiement :

bash
# Production
docker-compose -f docker-compose.yml up -d

# Développement
docker-compose -f docker-compose.dev.yml up


### 📈 Monitoring
- Interface Mongo Express (Port 8081)
- Logs centralisés
- Healthchecks pour chaque service

### ⚖️ Scalabilité
- Services indépendants
- Communication asynchrone via Kafka
- Architecture permettant le scaling horizontal
      

