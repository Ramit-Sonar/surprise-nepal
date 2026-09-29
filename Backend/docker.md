# 🐳 Docker Development Cheat Sheet

## 1. Build Image

# First time or after changing Dockerfile/dependencies

docker build -t surprise-nepal-backend .

# Build completely fresh without cache

docker build --no-cache -t surprise-nepal-backend .

## 2. Run Container

# Normal run

docker run -d `  -p 8000:8000`
--env-file .env `  --name surprise-nepal-backend`
surprise-nepal-backend

# Development run with live code changes

docker run -d `  -p 8000:8000`
--env-file .env `  --name surprise-nepal-backend`
-v "${PWD}:/app" `  -v /app/node_modules`
surprise-nepal-backend

## 3. Check Containers

# Running containers

docker ps

# All containers (including stopped)

docker ps -a

## 4. Check Logs

# Show logs

docker logs surprise-nepal-backend

# Follow logs continuously

docker logs -f surprise-nepal-backend

# Last 100 lines

docker logs --tail 100 surprise-nepal-backend

## 5. Container Control

# Stop

docker stop surprise-nepal-backend

# Start existing stopped container

docker start surprise-nepal-backend

# Restart

docker restart surprise-nepal-backend

# Remove stopped container

docker rm surprise-nepal-backend

# Force remove running container

docker rm -f surprise-nepal-backend

## 6. Enter Running Container

docker exec -it surprise-nepal-backend sh

# Exit container

exit

## 7. Check Images

docker images

# Remove an image

docker rmi surprise-nepal-backend

## 8. Docker Compose

# Start services

docker compose up -d

# Build and start

docker compose up -d --build

# Start without rebuilding

docker compose up -d

# Stop and remove containers + network

docker compose down

# Check services

docker compose ps

# View all logs

docker compose logs -f

# View only backend logs

docker compose logs -f backend

## 9. Development Decision

# Changed normal source code:

# app.js, routes, controllers, models, middleware, etc.

# → No rebuild if source is bind-mounted

docker compose up -d

# Changed package.json/package-lock.json:

# → Rebuild

docker compose up -d --build

# Changed Dockerfile:

# → Rebuild

docker compose up -d --build

## 10. When Container Is Broken

docker compose down
docker compose up -d --build

## 11. Port Already in Use

# Check port 8000

netstat -ano | findstr :8000

# Check which containers are using ports

docker ps

# Stop the container using the port

docker stop <container-name>

## 12. Debug Inside Container

docker exec -it surprise-nepal-backend sh

# Check files

ls

# Check current directory

pwd

# Check environment variables

env

# Exit

exit

## 13. Docker Cache Problem

# Clear build cache

docker builder prune -f

# Clear all unused build cache

docker builder prune -af

# Then rebuild

docker build --no-cache -t surprise-nepal-backend .

## ⭐ Daily Development Workflow

# First time

docker compose up -d --build

# Normal coding

docker compose up -d

# Watch backend logs

docker compose logs -f backend

# Changed dependencies or Dockerfile

docker compose up -d --build

# Finished working

docker compose down

## 🧠 Quick Rule

Source code changed
→ No rebuild (with volume/bind mount)

package.json changed
→ Rebuild

Dockerfile changed
→ Rebuild

Container stopped
→ docker start <container>

Need fresh container
→ docker compose down
→ docker compose up -d --build

Something not working
→ docker compose logs -f
