FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

RUN mkdir -p uploads

EXPOSE 5050

CMD ["node", "src/index.js"]
