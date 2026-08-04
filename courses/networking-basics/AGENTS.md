# Networking Basics — course notes for agents

Read the global `../AGENTS.md` first — it defines the file format and grading
contract. This file adds the specifics of *this* course.

## What this course teaches

A hands-on primer on IP addressing, taught by solving small networking problems
in code. Concepts introduced in order:

1. **IPv4 validation** — what makes an address well-formed (four octets 0–255).
2. **IPv4 → integer** — an address as one 32-bit big-endian number (the mental
   model behind all subnetting).
3. **CIDR → subnet mask** — translating a prefix length into a mask.
4. **Block size** — `2^(32 - prefix)` addresses in a CIDR block.
5. **Classful addressing** — the legacy A/B/C/D/E split by first octet.

## Conventions specific to this course

- The function is named `solve` in every language (see `../AGENTS.md`).
- Two lessons return a **`long` in Java** (IPv4→int and block size) because the
  values exceed `int` range. Keep the Java signature as `static long solve(...)`.
- String-returning lessons (mask, class) must return the exact dotted quad or
  single uppercase letter — compare against `expected` as a **quoted string**.
- Boolean-returning lesson (validation) returns `true` / `false`.
- No external libraries; the reference `solution` is in Python.

## Pedagogy

Each lesson body is short: the mental model → a worked example → a `:::tip`
pointing at the common mistake. Two lessons deserve extra care:
- IPv4→int introduces big-endian byte order — show `a<<24 | b<<16 | c<<8 | d`.
- Block size is pure binary thinking — `1 << (32 - prefix)`; the `:::`warning
  should warn that `2^32` exceeds Java's `int` (hence `long`).
