FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm","start"]
