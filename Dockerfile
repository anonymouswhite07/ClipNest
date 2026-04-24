# Use official Node.js image
FROM node:20-slim

# Install system dependencies (Python is required for yt-dlp)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Ensure yt-dlp binary is executable (handled by the package, but safety first)
# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
