FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# dummy env para build não quebrar
ENV NEXT_PUBLIC_SUPABASE_URL=dummy
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app ./
COPY .env.runtime .env.runtime

# carrega env runtime antes de iniciar
CMD export $(cat .env.runtime | xargs) && npm start
