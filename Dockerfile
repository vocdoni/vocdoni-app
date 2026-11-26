FROM node:22 AS builder
ARG VOCDONI_ENVIRONMENT
ENV VOCDONI_ENVIRONMENT=$VOCDONI_ENVIRONMENT
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm prepare && pnpm build
# The PostHog key comes in as a BuildKit secret so it never lands in an image layer:
#   docker build --secret id=posthog_cli_api_key,env=POSTHOG_CLI_API_KEY .
RUN --mount=type=secret,id=posthog_cli_api_key \
    POSTHOG_CLI_API_KEY="$(cat /run/secrets/posthog_cli_api_key 2>/dev/null || true)" \
    sh scripts/posthog-sourcemaps.sh dist
RUN pnpm prune --prod --ignore-scripts

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--max-old-space-size=328"

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

USER node

EXPOSE 3000
CMD ["node", "server/index.mjs"]
