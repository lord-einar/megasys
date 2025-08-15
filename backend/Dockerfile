FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads/pdfs uploads/temp logs

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "server.js"]