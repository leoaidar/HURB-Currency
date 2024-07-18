# Use the official Node.js 20 image.
# https://hub.docker.com/_/node
FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to workspace
COPY package*.json ./

# Installs production dependencies.
RUN npm install

# Copies everything over to Docker environment
COPY . .

# Builds the application
RUN npm run build

# Exposes port 3000 on container
EXPOSE 3000

# Specifies the command to run within the container.
CMD ["npm", "start"]