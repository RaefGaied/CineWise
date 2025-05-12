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

# Create proto directory
RUN mkdir -p /usr/src/proto

# Copy proto files from the local proto directory
COPY proto/*.proto /usr/src/proto/

# Copy the source code from the correct location
COPY . .

# Compiler le code TypeScript avec vérification
RUN npm run build && \
    if [ ! -f dist/index.js ]; then \
        echo "dist/index.js not found after build" && exit 1; \
    fi

# Exposer le port HTTP
EXPOSE 3003

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3003
ENV MONGODB_URI=mongodb://admin:adminpassword@mongodb:27017/cinewise-users
ENV JWT_SECRET=your_jwt_secret_key
ENV JWT_EXPIRES_IN=24h

# Démarrer l'application
CMD ["node", "dist/index.js"]