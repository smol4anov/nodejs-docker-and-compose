FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:16-alpine as backend_kupipodari
WORKDIR /app
COPY package*.json ./
COPY ./ecosystem.config.js ./
RUN npm i -g pm2 && npm ci --omit=dev --no-audit --no-fund
COPY --from=builder /app/dist/ ./dist

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"] 