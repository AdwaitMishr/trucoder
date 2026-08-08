FROM node:20-alpine

WORKDIR /app

# install dependencies first so the layer cache survives code changes
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# run as an unprivileged user — never as root in production
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

# the platform can see when this container is actually healthy
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
