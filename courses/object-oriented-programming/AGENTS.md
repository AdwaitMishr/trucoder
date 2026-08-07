# C++ & OOP — course notes for agents

Read the global `../AGENTS.md` first (file format + grading contract). This
file adds this course's specifics.

## Purpose

Interview-revision course for the C++/OOP section of a placement checklist
(TODO §1). Short, to-the-point notes. Skeleton per lesson: concept → key
points (bullets) → **Use case** → flowchart → **interview questions** → quiz.

## Lesson map

| # | Lesson | Difficulty | Covers (TODO §1) |
|---|--------|-----------|------------------|
| 1 | classes-objects | beginner | classes & objects, access specifiers, constructors/destructors (default/parameterized/copy), `this` pointer, static members/functions |
| 2 | encapsulation-abstraction | easy | encapsulation, abstraction, abstract classes vs interfaces, friend functions/classes |
| 3 | inheritance | easy | single, multiple, multilevel, hierarchical, hybrid; diamond problem; virtual inheritance |
| 4 | polymorphism | medium | compile-time (function/operator overloading), runtime (virtual functions), vtable & vptr, abstract classes |
| 5 | copy-semantics-memory | medium | copy ctor vs assignment, deep vs shallow copy, Rule of Three/Five, stack vs heap, new/delete, memory leaks |
| 6 | modern-cpp-stl | medium | smart pointers (unique/shared/weak), RAII, STL containers & algorithms, const correctness, move semantics & std::move |
| 7 | modern-cpp-deep-dive | medium | auto deduction, structured bindings, optional/variant, if constexpr, constexpr vs const, lambdas vs function pointers vs std::function, nullptr vs NULL, concurrency (thread/mutex/lock_guard/async, data races, atomic), virtual + inline/static/private |
| 8 | design-patterns | medium | patterns vs principles, SOLID one-liners, Singleton (Meyers, why anti-pattern), Factory/Factory Method, Observer, Strategy, Builder/Decorator/Adapter one-liners |
| 9 | final-assessment | medium | interview-favourite questions + comprehensive exam across lessons 1–8 |

## Conventions

- All lessons use `blocks:`. Flowcharts where helpful; mcq/mscq quizzes.
- **Interview questions:** every lesson's markdown blocks include at least 2
  `:::tip` callouts phrased as `**Interview question:** <question> — <model
  answer>` (e.g. "what is the diamond problem?", "when do you need a virtual
  destructor?", "struct vs class in C++?", "const correctness?", "what does
  std::move really do?"). The final exam is FAQ-heavy.
- **Code blocks:** exactly 3 in the whole course, in lessons 1, 5, 6.
  Languages: **[cpp, python]** (C++ is the point of this course; Python is the
  verifier's language). C++ starter MUST compile with `g++ -std=c++17 -O2`.
- **C++ conventions (from the global contract):** the harness calls
  `solve(...)`; `<vector>`, `<string>`, `<algorithm>` available, include
  anything else; solve at global scope, declared once; integer→`int`/`long
  long`, array of integers→`std::vector<int>`, string→`std::string`. Starter
  may define a class ABOVE solve (e.g. a `Circle` class) and use it inside
  solve — that is how OOP is exercised in the harness.
- Suggested exercises (pick sensible, testable versions):
  - L1: `solve(radius: double) -> double` — implement a `Circle` class with a
    constructor + `area()` method in the C++ starter, call it from solve
    (languages cpp+python; keep radius small; expected rounded to 2 decimals
    as a double — CAREFUL: doubles compare as JSON text, so use values that
    serialize cleanly, e.g. expect exactly 28.274333882308138 for r=3, or
    return a formatted 2-decimal string instead. Prefer returning a STRING
    rounded to 2 decimals — "28.27" — to dodge float JSON issues).
  - L5: `solve(a: list[int]) -> list[int]` — return a copy where each element
    is doubled, written to exercise value-copy semantics (in C++: pass by
    const ref, build a new vector).
  - L6: `solve(v: list[int]) -> list[int]` — return the sorted unique
    elements of v using STL (std::sort + std::unique, or std::set).
- `solution` is always Python; tests must match it. At most one code block per
  lesson. Expected strings quoted; arrays as JSON lists.
- YAML block scalars: content under `content: |` indented 6 spaces, no tabs.

## Validating

Do NOT run verify.js while other agents are writing. Self-check a file with:

```bash
node -e 'const gm=require("/home/monke/monke/my-projects/trucoder/server/node_modules/gray-matter");const fs=require("fs");for(const f of process.argv.slice(1)){const d=gm(fs.readFileSync(f,"utf8"));const b=d.data.blocks||[];console.log(f.split("/").pop(),"frontmatter OK,",b.length,"blocks")}' <files...>
```

## Pedagogy

Interview answers are short. Every lesson teaches the concept, the C++
syntax, the common interview trap (e.g. slicing, dangling pointers, copy
elision, vptr cost), and the FAQ callout. The three code lessons make the
learner WRITE C++ that compiles in a real g++17 sandbox.
