#!/usr/bin/env node
// Course content linter — the automated gate behind AGENTS.md.
// Scans every course's .mdx files for directive (callout) misuse and
// unreferenced assets. Exits non-zero on ANY violation so CI rejects
// the PR. Keep in sync with courses/AGENTS.md (section 6 + assets).
//
// Rules:
//   1. Container directives open with EXACTLY three colons: `:::tip`.
//      `::tip` (two colons) is a typo — error.
//   2. Nothing may follow the directive name on the opener line, unless
//      it is an explicit label `[Label]` or attributes `{...}`.
//      `:::tip **text**` (content on the same line) renders as literal
//      text — error.
//   3. Every `:::name` opener must be closed by a bare `:::` line.
//   4. Directive names are limited to: tip, warning, note, example, video.
//   5. `:::video` must use curly-brace attributes: `:::video{url="..."}`.
//      The space form (`:::video url="..."`) renders as literal text.
//   6. Every file in courses/<id>/assets/ must be referenced by a
//      `src:` (image block) in that course's lessons or course.mdx.
//
// Fenced code blocks (```) are skipped — examples live in them legally.

const fs = require("fs");
const path = require("path");

const COURSES_DIR = path.resolve(__dirname, "../../courses");
const ALLOWED = new Set(["tip", "warning", "note", "example", "video"]);
let errors = 0;

function err(file, line, msg) {
  errors += 1;
  console.log(`  ✗ ${path.relative(COURSES_DIR, file)}:${line}: ${msg}`);
}

function checkMdx(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const stack = []; // open directive names
  let fence = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const m = raw.match(/^\s*(`{3,})/);
    if (m) {
      fence = !fence;
      continue;
    }
    if (fence) continue;

    const close = raw.match(/^\s*:::\s*$/);
    if (close) {
      if (stack.length === 0) {
        err(file, i + 1, "closing ':::' with no open directive");
      } else {
        stack.pop();
      }
      continue;
    }

    const open = raw.match(/^\s*:::([a-zA-Z]+)(.*)$/);
    if (open) {
      const name = open[1];
      const rest = open[2];
      if (!ALLOWED.has(name)) {
        err(file, i + 1, `unknown directive ':::${name}' (allowed: ${[...ALLOWED].join(", ")})`);
      }
      const trimmed = rest.trim();
      if (trimmed && !trimmed.startsWith("[") && !trimmed.startsWith("{")) {
        err(
          file,
          i + 1,
          `content on the opener line — move it to the next line: ':::${name}${trimmed.slice(0, 40)}'`
        );
      }
      if (name === "video" && trimmed.startsWith("url=")) {
        err(file, i + 1, ":::video space form renders as literal text — use :::video{url=\"...\"}");
      }
      stack.push(name);
      continue;
    }

    const two = raw.match(/^\s*::(?!:)([a-zA-Z]+)/);
    if (two) {
      err(file, i + 1, `two-colon typo '::${two[1]}' — use three colons (:::)`);
    }
  }

  if (stack.length > 0) {
    err(file, lines.length, `unclosed directive(s): ${stack.join(", ")}`);
  }
}

function checkAssets(courseDir) {
  const assetsDir = path.join(courseDir, "assets");
  if (!fs.existsSync(assetsDir)) return;
  const files = fs.readdirSync(assetsDir).filter((f) => !f.startsWith("."));
  if (files.length === 0) return;

  const refs = new Set();
  const scan = (p) => {
    if (fs.statSync(p).isDirectory()) {
      for (const f of fs.readdirSync(p)) scan(path.join(p, f));
      return;
    }
    const text = fs.readFileSync(p, "utf8");
    for (const m of text.matchAll(/src:\s*([^\s"']+\.png|[^\s"']+\.(?:svg|jpg|jpeg|webp))/g)) {
      refs.add(m[1]);
    }
  };
  scan(path.join(courseDir, "lessons"));
  const cm = path.join(courseDir, "course.mdx");
  if (fs.existsSync(cm)) {
    const text = fs.readFileSync(cm, "utf8");
    for (const m of text.matchAll(/src:\s*([^\s"']+\.(?:png|svg|jpg|jpeg|webp))/g)) refs.add(m[1]);
  }

  for (const f of files) {
    if (!refs.has(f)) {
      err(path.join(courseDir, "assets", f), 1, `unreferenced asset — remove it or add a src: block`);
    }
  }
}

const courses = fs.readdirSync(COURSES_DIR).filter((d) => {
  const p = path.join(COURSES_DIR, d);
  return fs.statSync(p).isDirectory() && d !== "assets";
});

for (const c of courses) {
  const dir = path.join(COURSES_DIR, c);
  const lessons = path.join(dir, "lessons");
  if (fs.existsSync(lessons)) {
    for (const f of fs.readdirSync(lessons).filter((f) => f.endsWith(".mdx"))) {
      checkMdx(path.join(lessons, f));
    }
  }
  const cm = path.join(dir, "course.mdx");
  if (fs.existsSync(cm)) checkMdx(cm);
  checkAssets(dir);
}

if (errors > 0) {
  console.log(`\ncourse lint FAILED — ${errors} violation(s). See courses/AGENTS.md.`);
  process.exit(1);
}
console.log(`course lint OK (${courses.length} courses, no directive or asset violations)`);
