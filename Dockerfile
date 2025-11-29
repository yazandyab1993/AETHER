# Multi-stage build for Aether AI Platform
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install serve globally to serve static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]