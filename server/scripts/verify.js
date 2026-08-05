// Verify every course: run each lesson's reference solution against all its
// public + private tests. A lesson is green only if its tests match its solution.
process.env.DATA_DIR = "/tmp/trucoder-verify-data";
const { scanCourses, getCourses } = require("../dist/courses/loader");
const { submit } = require("../dist/judge");

(async () => {
  scanCourses();
  let pass = 0;
  let fail = 0;
  for (const course of getCourses()) {
    console.log(`\n== ${course.title} ==`);
    for (const lesson of course.lessons) {
      if (!lesson.solution) {
        // Content-only lessons have no tests to run — not a failure.
        console.log(`  SKIP ${lesson.id} (content — no exercise)`);
        continue;
      }
      const res = await submit(lesson, "python", lesson.solution);
      if (res.verdict === "accepted") {
        pass += 1;
        console.log(
          `  PASS ${lesson.id} (${res.publicTests.length} pub + ${res.privateTotal} priv)`
        );
      } else {
        fail += 1;
        console.log(`  FAIL ${lesson.id} verdict=${res.verdict}`);
        const bad = res.publicTests.find((t) => t.error) ?? res.publicTests.find((t) => !t.passed);
        if (bad) {
          console.log(
            "    " + (bad.error || `expected ${bad.expected} got ${bad.actual}`)
          );
        }
      }
    }
  }
  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})();
