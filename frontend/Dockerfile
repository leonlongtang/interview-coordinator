FROM node:22-alpine

WORKDIR /app

# Install dependencies first (cache-friendly)
COPY package.json package-lock.json* ./
RUN npm install

# Copy project
COPY . .

# Build the app - creates dist/ for production. VITE_API_URL must be set as
# build arg or env so the frontend is built with the correct backend URL.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Railway uses PORT; serve reads it from env. railway.json startCommand overrides if set.
EXPOSE 5173
CMD ["npm", "run", "start"]
