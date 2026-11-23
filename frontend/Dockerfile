
# Use Node.js 22
FROM node:22

# Set working directory
WORKDIR /app

# Enable pnpm using Corepack
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY . .

# Vite frontend port
ENV PORT=8443
ENV CHOKIDAR_USEPOLLING=true

# Expose frontend port
EXPOSE 8443

# Start Vite development server
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8443"]
