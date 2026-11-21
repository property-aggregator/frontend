# Production image using Next.js standalone output.
#   docker build -t property-aggregator-frontend .
#   docker run -p 3000:3000 --env-file .env.local property-aggregator-frontend

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# src/lib/env.ts validates variables on import, so the build needs placeholders.
# Real values are provided to the container at runtime; nothing here is a secret.
ENV NEXT_TELEMETRY_DISABLED=1 \
	API_BASE_URL=http://build-placeholder.invalid \
	AUTH0_DOMAIN=build-placeholder.invalid \
	AUTH0_CLIENT_ID=build-placeholder \
	AUTH0_CLIENT_SECRET=build-placeholder \
	AUTH0_AUDIENCE=build-placeholder \
	AUTH0_SECRET=0000000000000000000000000000000000000000000000000000000000000000 \
	APP_BASE_URL=http://build-placeholder.invalid
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
	NEXT_TELEMETRY_DISABLED=1 \
	PORT=3000 \
	HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
