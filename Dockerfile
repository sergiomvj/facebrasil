FROM node:20-alpine AS deps
WORKDIR /app
# Install libc6-compat for compatability with some native modules
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm install --production=false

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ARGs for public environment variables (Required for Next.js build and client-side usage)
# These are NOT secrets, so it is safe to include them in the build.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ARG SUPABASE_SERVICE_ROLE_KEY
ARG SUPABASE_TOKEN
ARG SUPABASE_PASSWORD
ARG SUPABASE_CONNECTION
ARG STRIPE_PUBLISHABLE_KEY
ARG N8N_API_KEY
ARG CLERK_SECRET_KEY
ARG OPENAI_API_KEY
ARG GIT_SHA

ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_TOKEN=$SUPABASE_TOKEN
ENV SUPABASE_PASSWORD=$SUPABASE_PASSWORD
ENV SUPABASE_CONNECTION=$SUPABASE_CONNECTION
ENV STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
ENV N8N_API_KEY=$N8N_API_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV GIT_SHA=$GIT_SHA

ENV NODE_ENV=production
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install libc6-compat in runner as well if needed for runtime (sometimes needed for sharp etc)
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
