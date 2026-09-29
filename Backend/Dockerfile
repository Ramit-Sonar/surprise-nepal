# Use Node.js 22
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY . .

# Application port
EXPOSE 8000

# Enable file polling for development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Start development server
CMD ["npm", "run", "dev"]