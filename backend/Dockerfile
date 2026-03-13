FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema src/prisma/schema.prisma

EXPOSE 5000

CMD ["node", "src/index.js"]