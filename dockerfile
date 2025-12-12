# Stage 1: Dependency Installation and Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache python3 make g++
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
# Environment variables for Next.js runtime
ENV NODE_ENV production
# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Next.js defaults to port 3000, we'll use 8001 to avoid conflicts
EXPOSE 8001
CMD ["npm", "start"]