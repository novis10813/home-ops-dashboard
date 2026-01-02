# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
# Note: Frontend calls /internal on same origin, server.js proxies to gateway
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
