FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN node node_modules/prisma/build/index.js generate --schema src/prisma/schema.prisma

EXPOSE 5000

CMD ["node", "src/index.js"]