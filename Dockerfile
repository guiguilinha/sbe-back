# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção
FROM node:20
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expõe a porta que o app vai rodar
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["npm", "start"]
