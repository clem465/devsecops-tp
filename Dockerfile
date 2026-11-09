
# ==========================================
# Stage 1 : Installation des dépendances
# ==========================================
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# ==========================================
# Stage 2 : Image finale
# ==========================================
FROM node:22-alpine AS production

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
