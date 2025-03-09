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

# Use Nginx to serve frontend
FROM nginx:latest
WORKDIR /usr/share/nginx/html

# Copy built frontend files from the builder stage
COPY --from=builder /frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
