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
# Adiciona o script wait-for-it e o torna executável
ADD https://github.com/vishnubob/wait-for-it/raw/master/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Expõe a porta que o app vai rodar
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["npm", "start"]
