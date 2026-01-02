# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for Vite build
# VITE_GATEWAY_URL is baked into the bundle at build time
ARG VITE_GATEWAY_URL=http://gateway:8000
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL

# Build the frontend
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
