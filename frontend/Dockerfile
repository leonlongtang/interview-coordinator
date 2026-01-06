FROM node:22-alpine

WORKDIR /app

# Install dependencies first (cache-friendly)
COPY package.json package-lock.json* ./
RUN npm install

# Copy project
COPY . .

EXPOSE 5173
