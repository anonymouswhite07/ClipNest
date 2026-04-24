# Build Stage
FROM node:18-slim as build

WORKDIR /app

# Install system dependencies for yt-dlp
RUN apt-get update && apt-get install -y python3 curl && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

COPY package*.json ./
RUN npm install --production

COPY . .

# Final Stage
FROM node:18-slim

WORKDIR /app

# Copy python and yt-dlp from build stage
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/local/bin/yt-dlp /usr/local/bin/yt-dlp
COPY --from=build /app /app

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
