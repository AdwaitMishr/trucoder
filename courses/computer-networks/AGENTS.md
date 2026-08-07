# Computer Networks — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics.

## Purpose

Interview-revision course for the CN section of a placement checklist. Short,
to-the-point notes. Skeleton per lesson: concept → key points (bullets) →
**Use case** → flowchart → worked numerical → **interview questions** → quiz.

## Lesson map

| # | Lesson | Difficulty | Covers (TODO §4) |
|---|--------|-----------|------------------|
| 1 | osi-tcpip-models | beginner | 7 OSI layers + functions, TCP/IP 4-layer vs OSI, encapsulation/decapsulation |
| 2 | physical-datalink | easy | media types, error detection (parity, CRC, Hamming), flow control (stop-and-wait, sliding window), CSMA/CD & CSMA/CA, Ethernet framing |
| 3 | network-layer | easy | IPv4/IPv6, subnetting & CIDR (code exercise), routing (distance vector, link state), ARP/RARP/ICMP, NAT & DHCP |
| 4 | transport-layer | medium | TCP vs UDP, 3-way handshake & 4-way termination, flow & congestion control, sliding window, ports & sockets, RTT estimation (EWMA), Nagle vs silly window syndrome |
| 5 | application-layer | easy | HTTP vs HTTPS (TLS), HTTP/1.1 vs 2 vs 3, DNS resolution, SMTP/FTP/SSH, WebSockets vs SSE vs long-polling, REST vs GraphQL, gRPC |
| 6 | network-security | medium | symmetric vs asymmetric, SSL/TLS handshake, TLS 1.3 (1-RTT/0-RTT, forward secrecy), firewalls & VPNs, DoS/DDoS/MITM/SQLi, CORS/CSRF/SSRF/cookie flags |
| 7 | debugging-and-real-world-networking | easy | ping (ICMP reachability), traceroute (TTL mechanism), dig/nslookup, curl -v, tcpdump flags, layered troubleshooting ladder, NXDOMAIN vs timeout, connection refused vs timeout |
| 8 | networking-in-system-design | medium | DNS caching/TTL/anycast + CDN geo-routing, CDN hit vs miss, L4 vs L7 load balancers, LB algorithms, reverse proxy duties, health checks, sticky sessions |
| 9 | final-assessment | medium | comprehensive exam across sections 1–8 |

## Conventions

- All lessons use `blocks:`. Flowcharts for every diagram; mcq/mscq quizzes;
  numericals with FULL working in explanations (subnetting, Hamming, sliding
  window, TCP throughput, etc.).
- **Interview questions:** every lesson's markdown blocks include at least 2
  `:::tip` callouts phrased as `**Interview question:** <question> — <model
  answer>`. The final exam mixes FAQ-style questions with numerics.
- **Code block:** exactly ONE in lesson 3 — subnetting calculator:
  `solve(ip: str, prefix: int) -> str` returns the network address
  (e.g. solve("192.168.1.37", 24) → "192.168.1.0"). Languages:
  [python, javascript, cpp]. Solution in Python. Public test shows the contract;
  private tests cover /8, /16, /24, /30, /32 edges.
- Lessons 7 and 8 are quiz-only (no code block, no `type: code`); the course's
  single code exercise stays in lesson 3.
- Numbers: subnetting outputs are strings — quote them in `expected`.
- YAML block scalars: content under `content: |` indented 6 spaces, no tabs.
- At most one code block per lesson.

## Validating

Do NOT run verify.js while other agents are writing (it reads the whole tree).
Self-check a file with:

```bash
node -e 'const gm=require("/home/monke/monke/my-projects/trucoder/server/node_modules/gray-matter");const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));const b=d.data.blocks||[];console.log(f.split("/").pop(),"frontmatter OK,",b.length,"blocks")}' <files...>
```

## Pedagogy

Interview answers are short: define in one line, key points, use case, numbers.
Every numerical shows its working. Subnetting MUST be practiced by hand —
worked examples in markdown + MCQ numerics + the code exercise.
