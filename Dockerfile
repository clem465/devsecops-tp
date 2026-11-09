
# ==========================================
# Stage 1 : Installation des dépendances
# ==========================================
FROM node:26-alpine AS dependencies

WORKDIR /app

# Mise à jour de npm pour corriger les vulnérabilités
RUN npm install --global npm@11.21.2

COPY package*.json ./

RUN npm ci --omit=dev

# ==========================================
# Stage 2 : Image finale
# ==========================================
FROM node:26-alpine AS production

# Mise à jour de npm dans l'image finale
RUN npm install --global npm@11.21.2

ENV NODE_ENV=production

WORKDIR /app

# Copier uniquement les dépendances de production
COPY --from=dependencies /app/node_modules ./node_modules

# Copier le code source
COPY src/ ./src/

# Utilisateur non privilégié
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
