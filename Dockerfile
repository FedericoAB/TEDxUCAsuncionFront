# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install all dependencies (including devDependencies for the build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build for production
COPY . .
RUN npm run build

# Stage 2: Serve the built app with a lightweight Node/Express server
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only the production dependency manifests and install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the compiled Angular output and the Express server from the builder stage
COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
