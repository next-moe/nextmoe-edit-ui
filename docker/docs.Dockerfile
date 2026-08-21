#
# Build + run the edit-ui demo/docs site (apps/playground) — Nuxt 4, Nitro
# node-server.
#
# Build context MUST be the repo root: the site consumes the @nextmoe/edit-ui-*
# workspace packages (it imports the Vue package's dist and @source-scans
# packages/vue/src), so those packages must be present and built first.
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-trixie-slim AS base
RUN corepack enable
WORKDIR /repo

# ---- deps: copy manifests, install the site subgraph (+ workspace deps) ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json     packages/core/package.json
COPY packages/vue/package.json      packages/vue/package.json
COPY packages/nuxt/package.json     packages/nuxt/package.json
COPY apps/playground/package.json   apps/playground/package.json
# No --ignore-scripts here (unlike the usual recipe): vue-demi's postinstall
# rewrites its shim to the installed Vue major, and skipping it leaves
# @vueuse/integrations — which ImageField imports — resolving against the Vue 2
# shim. pnpm-workspace.yaml's onlyBuiltDependencies is the allowlist that lets
# exactly that script (and esbuild's) run. No package here has a postinstall
# that needs the sources, so nothing is lost.
RUN pnpm install --frozen-lockfile --filter "@nextmoe/edit-ui-playground..."

# ---- build: build the workspace packages, then the site ----
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages packages
COPY apps/playground apps/playground
# core (tsup) + vue (vite) must be built before the site: the Nuxt module
# imports EDIT_UI_COMPONENT_NAMES from the vue package's dist at config time.
# The nuxt package ships raw TS and needs no build.
RUN pnpm --filter @nextmoe/edit-ui-core build \
 && pnpm --filter @nextmoe/edit-ui-vue build \
 && pnpm --filter @nextmoe/edit-ui-playground build

# ---- run: just Node + the self-contained .output ----
FROM node:${NODE_VERSION}-trixie-slim AS run
ENV NODE_ENV=production HOST=0.0.0.0 NITRO_PORT=6760
WORKDIR /app
COPY --from=build /repo/apps/playground/.output ./.output
USER node
EXPOSE 6760
CMD ["node", ".output/server/index.mjs"]
