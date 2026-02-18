FROM node:20-slim
WORKDIR /app

# Install build dependencies for node-pty and runtime dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    lm-sensors \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (Latest Static Binary)
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-26.1.3.tgz -o docker.tgz \
    && tar xzvf docker.tgz \
    && mv docker/docker /usr/local/bin/ \
    && rm -rf docker docker.tgz

COPY package*.json ./
RUN npm install

COPY . .

# Setup Defaults and Entrypoint
RUN mkdir -p /app/defaults /app/scripts
COPY config/default.json /app/defaults/default.json
COPY scripts/init-config.js /app/scripts/init-config.js
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "start"]
