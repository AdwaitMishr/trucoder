# Node module-runner sandbox (JS + TS) for TruCoder module exercises.
# Separate from the main trucoder-sandbox image so function-mode grading is
# never affected. Node 24 strips TypeScript types natively (no tsx needed for
# plain modules; enums/namespaces need --experimental-transform-types).
FROM node:24-alpine

RUN apk add --no-cache dumb-init \
    && addgroup -S app && adduser -S app -G app

# Dependencies required by module-exercise test suites (Express for the
# integration tests that boot a real app). Installed into a shared NODE_PATH
# so require() resolves from any workdir.
RUN mkdir -p /opt/deps && cd /opt/deps \
    && npm init -y >/dev/null 2>&1 \
    && npm install --no-audit --no-fund express@4 >/dev/null 2>&1
ENV NODE_PATH=/opt/deps/node_modules

COPY run.sh /usr/local/bin/tru-run
COPY tru-reporter.js /opt/tru-reporter.js
RUN chmod +x /usr/local/bin/tru-run

# Static docker CLI for the sandbox daemon (musl-static — the host's glibc
# docker binary cannot run on alpine). Compose overrides the entrypoint to
# run sandboxd.js; per-run spawns keep the default tru-run entrypoint.
# TARGETARCH-aware: arm64 (Pi) vs amd64 (CI) — docker's static dirs are
# aarch64/ and x86_64/.
ARG TARGETARCH
RUN case "$TARGETARCH" in \
      arm64) DOCKER_ARCH=aarch64 ;; \
      amd64) DOCKER_ARCH=x86_64 ;; \
      *) echo "unsupported TARGETARCH=$TARGETARCH"; exit 1 ;; \
    esac \
    && wget -qO /tmp/docker.tgz \
        https://download.docker.com/linux/static/stable/${DOCKER_ARCH}/docker-26.1.4.tgz \
    && tar -xzf /tmp/docker.tgz -C /tmp docker/docker \
    && mv /tmp/docker/docker /usr/local/bin/docker \
    && chmod 755 /usr/local/bin/docker \
    && rm -rf /tmp/docker /tmp/docker.tgz

COPY sandboxd.js /opt/sandboxd.js
# copies arrive 600 root-owned — the non-root daemon user must read it
RUN chmod 644 /opt/sandboxd.js

USER app
WORKDIR /tmp

ENTRYPOINT ["dumb-init", "--", "tru-run"]
