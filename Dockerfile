# Stage 1: Build User Interface (Frontend)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
RUN npm install
COPY client/ ./
#RUN npm run build

# Stage 2: Setup Server & Final Image
FROM node:20-alpine
WORKDIR /app

# Install Server Dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev
#RUN npm ci --only=production

# Copy Server Code
COPY server/ ./

# Copy Frontend Build from Stage 1 to Public Directory
COPY --from=frontend-builder /app/client/dist ./public

# Setup Data Directory
RUN mkdir -p /app/data
ENV DB_PATH=/app/data/database.sqlite
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
