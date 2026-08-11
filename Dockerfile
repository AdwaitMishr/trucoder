# TruCoder app image — multi-stage.
# Build stage: server tsc + web vite build. Runtime: node:24-slim (glibc,
# so better-sqlite3 uses its prebuilt linux-arm64 binary — no compilation).
#
# The app container has NO docker socket. Grading goes over the internal
# compose network to the sandbox daemons (SANDBOX_URL / SANDBOX_NODE_URL).

FROM node:24-slim AS build
WORKDIR /src

ARG BUILD_COMMIT=dev
ENV BUILD_COMMIT=${BUILD_COMMIT}

# Toolchain insurance: better-sqlite3 13.x ships arm64 glibc prebuilds, but
# if any native dep ever lacks one, the build stage can compile it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json /src/server/
RUN cd /src/server && npm ci
COPY server/ /src/server/
RUN cd /src/server && npx tsc && npm prune --omit=dev

COPY web/package.json web/package-lock.json /src/web/
RUN cd /src/web && npm ci
COPY web/ /src/web/
RUN cd /src/web && npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /src/server/dist /app/server/dist
COPY --from=build /src/server/scripts /app/server/scripts
COPY --from=build /src/server/package.json /app/server/package.json
COPY --from=build /src/server/node_modules /app/server/node_modules
COPY --from=build /src/web/dist /app/web/dist

# uid 1000 == host adith uid 1000, so the courses/ and data/ bind mounts
# (also adith-owned) are writable without root.
USER node

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
