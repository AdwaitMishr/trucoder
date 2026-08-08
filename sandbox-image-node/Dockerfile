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

USER app
WORKDIR /tmp

ENTRYPOINT ["dumb-init", "--", "tru-run"]
