# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine

# Install system dependencies for Sharp (image processing)
RUN apk add --no-cache vips-dev fftw-dev gcc g++ make libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install only production dependencies for runtime
RUN npm ci --only=production

# Create uploads directory
RUN mkdir -p uploads/images

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]