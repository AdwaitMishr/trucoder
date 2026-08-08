// Custom node:test reporter for TruCoder module exercises.
// Emits NDJSON with the same shape the judge's parseModuleResults expects:
//   {"type":"test:pass","name":"...","details":{...}}
//   {"type":"test:fail","name":"...","details":{"error":{message,actual,expected},"failureType":...}}
// The suite (file-level) event carries details.type === "suite" so the judge
// can skip it.
const { Transform } = require("node:stream");

function emit(event) {
  const d = event.data || {};
  const details = d.details || {};
  // Same shape as the built-in JSON reporter: { type, data: { name, details } }
  const out = { type: event.type, data: { name: String(d.name ?? ""), details: {} } };
  if (details.type) out.data.details.type = details.type;
  if (event.type === "test:fail") {
    const err = details.error;
    if (err && typeof err === "object") {
      out.data.details.error = {
        message: String(err.message ?? ""),
        actual:
          err.actual !== undefined
            ? typeof err.actual === "string"
              ? err.actual
              : safeJson(err.actual)
            : undefined,
        expected:
          err.expected !== undefined
            ? typeof err.expected === "string"
              ? err.expected
              : safeJson(err.expected)
            : undefined,
      };
    } else if (err !== undefined) {
      out.data.details.error = { message: String(err) };
    }
    out.data.details.failureType = details.failureType;
  }
  return JSON.stringify(out) + "\n";
}

function safeJson(v) {
  try {
    const s = JSON.stringify(v);
    return s === undefined ? String(v) : s;
  } catch {
    return String(v);
  }
}

module.exports = function truReporter() {
  return new Transform({
    writableObjectMode: true,
    transform(event, _enc, cb) {
      if (event.type === "test:pass" || event.type === "test:fail") {
        this.push(emit(event));
      }
      cb();
    },
  });
};
