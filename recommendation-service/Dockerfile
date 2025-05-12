# Utiliser Node.js LTS version
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copy tsconfig.json first
COPY tsconfig.json ./

# Créer le répertoire proto et copier les fichiers proto
RUN mkdir -p /usr/src/proto

# Copier les fichiers proto depuis le répertoire local
COPY proto/*.proto /usr/src/proto/

# Copier le code source
COPY . .

# Compiler le code TypeScript avec vérification
RUN npm run build && \
    if [ ! -f dist/index.js ]; then \
        echo "dist/index.js not found after build" && exit 1; \
    fi

# Exposer les ports pour gRPC et HTTP
EXPOSE 3002
EXPOSE 50052

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3002
ENV GRPC_PORT=50052
ENV MONGODB_URI=mongodb://mongodb:27017/cinewise-recommendations
ENV MOVIE_SERVICE_URL=http://movie-service:3001
ENV KAFKA_BROKERS=kafka:9092

# Démarrer l'application
CMD ["node", "dist/index.js"]