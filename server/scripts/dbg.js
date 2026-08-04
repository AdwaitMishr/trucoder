// Debug the container sandbox path directly (batch API).
const { runInSandbox } = require("../dist/sandbox");

(async () => {
  for (const lang of ["python", "javascript", "java"]) {
    const code =
      lang === "python"
        ? `def solve(n):\n    return n * 2`
        : lang === "javascript"
          ? `function solve(n){return n*2;}`
          : `static int solve(int n){return n*2;}`;
    try {
      const r = await runInSandbox({
        language: lang,
        code,
        tests: [{ args: [21] }, { args: [10] }],
        timeLimitMs: 3000,
      });
      console.log(`[${lang}] code=${r.code} timedOut=${r.timedOut}`);
      console.log(`  stdout=${JSON.stringify(r.stdout)}`);
      console.log(`  stderr=${JSON.stringify(r.stderr)}`);
      console.log(`  compileError=${JSON.stringify(r.compileError)}`);
    } catch (e) {
      console.log(`[${lang}] EXCEPTION: ${e.message}`);
    }
  }
})();
