FROM node:22.11-alpine AS builder

WORKDIR /usr/src/app

# Copy only package.json and package-lock.json
COPY . .

# Install Prisma dependencies
RUN npm install

# Build the application
RUN npm run build

FROM node:22.11-alpine AS runner

WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S -D -H -u 1001 -G nodejs nodejs

# Copy only necessary files from the build stage
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

# Install only production dependencies
RUN npm install --omit=dev

# Switch to the non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT}/ || exit 1

EXPOSE ${PORT}

# Start your application
CMD ["node", "dist/main.js"]