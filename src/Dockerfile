# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
# Copy the built files from the 'builder' stage to Nginx's web root directory
COPY --from=builder /app/build /usr/share/nginx/html
# Expose port 80 to the outside world
EXPOSE 80
# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]

