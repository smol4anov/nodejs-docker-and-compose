FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine as frontend_kupipodari
WORKDIR /app
COPY /nginx/conf.d/ /etc/nginx/conf.d
COPY --from=builder /app/build/ /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"] 