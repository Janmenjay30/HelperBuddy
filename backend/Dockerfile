# Use Node.js 20 Alpine as the base image (lightweight Linux distribution)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5000 (the port our Express server runs on)
EXPOSE 5000

# Command to run when the container starts
CMD ["npm", "start"]
