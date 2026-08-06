# TruCoder code-execution sandbox.
# Built for arm64 (Raspberry Pi). Runs each submission in an isolated container:
#   --network none, read-only rootfs, memory/CPU/pids caps, drop ALL caps,
#   no-new-privileges, non-root user, throwaway tmpfs workdir.
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        openjdk-17-jdk-headless \
        g++ \
        nodejs \
        python3 \
        curl \
        ca-certificates \
        coreutils \
    && rm -rf /var/lib/apt/lists/*

# Gson for Java JSON (result serialization + arg decoding).
RUN curl -fsSL -o /opt/gson.jar \
        https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar \
    && chmod 644 /opt/gson.jar

# nlohmann/json single header for the C++ driver (compiled with -I/opt).
RUN mkdir -p /opt/nlohmann \
    && curl -fsSL -o /opt/nlohmann/json.hpp \
        https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp \
    && chmod 644 /opt/nlohmann/json.hpp

COPY run.sh /usr/local/bin/run.sh
RUN chmod 755 /usr/local/bin/run.sh

RUN useradd -r -u 1000 -m trucoder
USER trucoder

ENTRYPOINT ["/usr/local/bin/run.sh"]
