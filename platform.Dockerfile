# Build + serve the standalone platform (integrator) SPA — separate from the end-user app
# (see Dockerfile). Static build via vite.platform.config.ts, served by nginx. VITE_ vars are
# baked at build time through build-args.
FROM node:22 AS builder
ARG VITE_SAAS_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_BASE_URL
ENV VITE_SAAS_URL=$VITE_SAAS_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_BASE_URL=$VITE_BASE_URL
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
# `pnpm prepare` runs chakra typegen so ~theme/system types exist for the build.
RUN pnpm prepare && pnpm build:platform
# rollup emits the entry as index.platform.html; nginx serves index.html by default.
RUN mv dist-platform/index.platform.html dist-platform/index.html

FROM nginx:1.27-alpine AS runner
COPY platform.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist-platform /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
