FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

# Instalar OpenSSL que necesita Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY . .

RUN node node_modules/prisma/build/index.js generate --schema src/prisma/schema.prisma

EXPOSE 5000

CMD ["node", "src/index.js"]