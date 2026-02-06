# ==========================================
# Dockerfile for NovaFacebrasil (Next.js 14+)
# Optimized for Easypanel / VPS Deployment
# ==========================================

# -----------------------------------------------------------------------------
# Stage 1: Base Image
# -----------------------------------------------------------------------------
# We use node:20-alpine for a small, secure, and efficient foundation.
FROM node:20-alpine AS base

# -----------------------------------------------------------------------------
# Stage 2: Dependencies (deps)
# -----------------------------------------------------------------------------
# This stage installs dependencies. It's separate to leverage Docker layer caching.
# If package.json hasn't changed, this stage is skipped on rebuilds.
FROM base AS deps
# libc6-compat might be needed for some native dependencies on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies (ci is strictly for clean installs based on lockfile)
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# -----------------------------------------------------------------------------
# Stage 3: Builder (builder)
# -----------------------------------------------------------------------------
# This stage compiles the application.
FROM base AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# Disable Next.js telemetry during build for privacy/speed
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
# Note: This relies on 'output: "standalone"' in next.config.js/ts
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production Runner (runner)
# -----------------------------------------------------------------------------
# This is the final image that will run on your server.
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build artifact
# The standalone folder contains a minimal server.js and strictly necessary node_modules
COPY --from=builder /app/public ./public

# Set permissions for the .next folder (required for Next.js cache writing)
mkdir .next
chown nextjs:nodejs .next

# Copy the built application from the builder stage
# We only copy the standalone folder and static assets to keep image small
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000 (Standard for Next.js)
# Easypanel will automatically detect this or you can configure it in the UI
EXPOSE 3000

# Set PORT environment variable
ENV PORT 3000

# Optionally, you can override hostname if needed, but 0.0.0.0 is best for Docker
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
