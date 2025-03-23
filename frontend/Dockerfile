# Use Node.js to build frontend
FROM node:20.2.0 AS builder
WORKDIR /frontend

# Copy package files first for better caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Build the frontend
RUN npm run build

# Final stage: Store the build in the shared volume
FROM alpine:latest
WORKDIR /frontend
# Ensure the built frontend is copied
COPY --from=builder /frontend/dist /frontend/dist  

VOLUME /frontend/dist  # Mark this directory as a volume
CMD ["sh", "-c", "echo 'Frontend built and ready' && sleep infinity"]
