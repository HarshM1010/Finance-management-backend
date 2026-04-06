FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate --config ./prisma.config.ts
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]