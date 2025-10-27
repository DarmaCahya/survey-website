# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && \
    npm run build && \
    npm prune --production

# Runner stage
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy production files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Note: Prisma schema is only needed for migrations (not at runtime)

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]

