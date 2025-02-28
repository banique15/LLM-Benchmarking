FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 