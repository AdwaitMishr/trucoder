import { Router } from "express";
import { getCourse, getLesson } from "../courses/loader";
import type { Block, CodeBlock, Lang, QuizBlock } from "../courses/types";
import {
  getProgress,
  getSolvedQuizBlocks,
  markLessonRead,
  recordAnswer,
  recordSubmission,
} from "../db";
import { runPublic, runModule, submit } from "../judge";

export const lessonsRouter = Router({ mergeParams: true });

function parseBody(body: unknown): { lang: Lang; code: string } | null {
  const b = body as { language?: unknown; code?: unknown };
  if (
    typeof b?.language !== "string" ||
    !["java", "javascript", "python", "cpp"].includes(b.language)
  ) {
    return null;
  }
  if (typeof b?.code !== "string" || b.code.trim().length === 0) return null;
  return { lang: b.language as Lang, code: b.code };
}

function paramsOf(req: {
  params: { courseId?: string; lessonId: string };
}): { courseId: string; lessonId: string } {
  // courseId comes from the parent router via mergeParams.
  return { courseId: req.params.courseId ?? "", lessonId: req.params.lessonId };
}

/** Find the lesson's code block (a lesson has at most one). */
function codeBlockOf(lesson: { blocks: Block[] }): CodeBlock | undefined {
  return lesson.blocks.find((b) => b.type === "code") as CodeBlock | undefined;
}

/** Quiz blocks of a lesson, with their block indices (server-side ids). */
function quizBlocksOf(lesson: { blocks: Block[] }): {
  index: number;
  block: QuizBlock;
}[] {
  return lesson.blocks
    .map((b, i) => ({ index: i, block: b as QuizBlock }))
    .filter(
      (x): x is { index: number; block: QuizBlock } =>
        x.block.type === "mcq" || x.block.type === "mscq"
    );
}

/** Strip server-only fields (answers, solutions) before sending blocks. */
function publicBlocks(lesson: { blocks: Block[] }): unknown[] {
  return lesson.blocks.map((b) => {
    if (b.type === "mcq" || b.type === "mscq") {
      const { answer: _answer, ...rest } = b;
      return rest;
    }
    if (b.type === "code") {
      const { solution: _solution, privateTests: _priv, ...rest } = b;
      return rest;
    }
    return b;
  });
}

/** Full lesson content for learning (public tests visible, private hidden). */
lessonsRouter.get("/:lessonId", (req, res) => {
  const userId = req.userId!;
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  const p = getProgress(userId, lesson.courseId, lesson.id);
  const solvedQuizzes = getSolvedQuizBlocks(userId, lesson.courseId, lesson.id);
  const quizBlocks = quizBlocksOf(lesson);

  // A lesson is solved when its graded blocks are all solved:
  // code block -> accepted submission (progress.solved); quizzes -> correct answers.
  // Content-only lessons are solved ONLY when marked read (POST .../read) —
  // defaulting them to solved made progress meaningless (owner report 2026-08).
  const codeSolved = Boolean(p?.solved);
  const quizSolved = quizBlocks.every((q) => solvedQuizzes.has(q.index));

  // Previous/next lesson within the course (ordered by `order`).
  const ordered = (getCourse(lesson.courseId)?.lessons ?? []).sort(
    (a, b) => a.order - b.order
  );
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  const prevLesson =
    idx > 0
      ? { id: ordered[idx - 1].id, title: ordered[idx - 1].title }
      : null;
  const nextLesson =
    idx >= 0 && idx < ordered.length - 1
      ? { id: ordered[idx + 1].id, title: ordered[idx + 1].title }
      : null;

  res.json({
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    difficulty: lesson.difficulty,
    order: lesson.order,
    tags: lesson.tags,
    hasExercise: lesson.hasExercise,
    blocks: publicBlocks(lesson),
    solvedBlocks: [...solvedQuizzes],
    progress: {
      solved: codeSolved && quizSolved,
      attemptCount: p?.attempt_count ?? 0,
    },
    lastCode: p?.last_code ?? null,
    lastLanguage: (p?.last_language as Lang) ?? null,
    prevLesson,
    nextLesson,
    lessonIndex: idx,
    lessonCount: ordered.length,
  });
});

/** Mark a lesson with no graded blocks as read (no coding exercise). */
lessonsRouter.post("/:lessonId/read", (req, res) => {
  const userId = req.userId!;
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  if (lesson.hasExercise || quizBlocksOf(lesson).length > 0) {
    return res
      .status(400)
      .json({ error: "this lesson has graded content — solve it instead" });
  }
  markLessonRead(userId, courseId, lessonId);
  res.json({ solved: true });
});

/** Grade a quiz block (mcq/mscq) and record the answer. */
lessonsRouter.post("/:lessonId/answer", (req, res) => {
  const userId = req.userId!;
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });

  const body = req.body as { blockId?: unknown; answers?: unknown };
  const blockId = Number(body?.blockId);
  if (!Number.isInteger(blockId) || blockId < 0) {
    return res.status(400).json({ error: "invalid blockId" });
  }
  const target = lesson.blocks[blockId];
  if (!target || (target.type !== "mcq" && target.type !== "mscq")) {
    return res.status(400).json({ error: "block is not a quiz" });
  }
  if (!Array.isArray(body?.answers) || body.answers.length === 0) {
    return res.status(400).json({ error: "invalid answers" });
  }
  const answers = [...new Set(body.answers.map(Number))].sort((a, b) => a - b);
  if (answers.some((a) => !Number.isInteger(a) || a < 0)) {
    return res.status(400).json({ error: "invalid answer indices" });
  }

  let correct: boolean;
  if (target.type === "mcq") {
    correct = answers.length === 1 && answers[0] === target.answer;
  } else {
    const want = [...target.answer].sort((a, b) => a - b);
    correct =
      answers.length === want.length &&
      answers.every((a, i) => a === want[i]);
  }

  recordAnswer(
    userId,
    lesson.courseId,
    lesson.id,
    blockId,
    correct,
    JSON.stringify(answers)
  );

  // A quiz-only lesson is complete when every quiz block is answered correctly.
  const solvedQuizzes = getSolvedQuizBlocks(userId, lesson.courseId, lesson.id);
  const quizSolved = quizBlocksOf(lesson).every((q) => solvedQuizzes.has(q.index));
  const lessonSolved = !lesson.hasExercise && quizSolved;
  if (lessonSolved) markLessonRead(userId, lesson.courseId, lesson.id);

  res.json({
    correct,
    explanation: correct ? target.explanation : "",
    lessonSolved,
  });
});

/** Run the visible public tests (fast feedback while coding). */
lessonsRouter.post("/:lessonId/run", async (req, res) => {
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  const block = codeBlockOf(lesson);
  if (!block) {
    return res.status(400).json({ error: "this lesson has no coding exercise" });
  }
  const raw = req.body as { language?: unknown; code?: unknown };
  if (block.mode === "module") {
    const spec = block.module;
    if (!spec) return res.status(400).json({ error: "module spec missing" });
    if (raw.language !== spec.language || typeof raw.code !== "string") {
      return res.status(400).json({ error: "invalid body" });
    }
    try {
      const result = await runModule(block, raw.code);
      if (result.sandboxError) {
        return res.status(503).json({ error: result.sandboxError });
      }
      return res.json({
        module: true,
        publicTests: result.results,
        output: result.output,
        compileError: result.compileError,
      });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
  const body = parseBody(req.body);
  if (!body) return res.status(400).json({ error: "invalid body" });
  if (!block.signature[body.lang] || !block.starterCode[body.lang]) {
    return res.status(400).json({ error: `lesson does not support ${body.lang}` });
  }
  try {
    const result = await runPublic(block, body.lang, body.code);
    if (result.sandboxError) {
      return res.status(503).json({ error: result.sandboxError });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/** Final grading: public + hidden tests, then persist progress. */
lessonsRouter.post("/:lessonId/submit", async (req, res) => {
  const userId = req.userId!;
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  const block = codeBlockOf(lesson);
  if (!block) {
    return res.status(400).json({ error: "this lesson has no coding exercise" });
  }
  const raw = req.body as { language?: unknown; code?: unknown };
  if (block.mode === "module") {
    const spec = block.module;
    if (!spec) return res.status(400).json({ error: "module spec missing" });
    if (raw.language !== spec.language || typeof raw.code !== "string") {
      return res.status(400).json({ error: "invalid body" });
    }
    try {
      const result = await runModule(block, raw.code);
      if (result.sandboxError) {
        return res.status(503).json({ error: result.sandboxError });
      }
      const passed = result.results.filter((r) => r.passed).length;
      const total = result.results.length;
      const verdict = total > 0 && passed === total ? "accepted" : "wrong";
      recordSubmission({
        userId,
        courseId: lesson.courseId,
        lessonId: lesson.id,
        language: String(raw.language),
        code: raw.code,
        verdict,
        publicPassed: passed,
        publicTotal: total,
        privatePassed: 0,
        privateTotal: 0,
        compileError: result.compileError,
      });
      return res.json({
        module: true,
        verdict,
        publicTests: result.results,
        output: result.output,
        privatePassed: 0,
        privateTotal: 0,
      });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
  const body = parseBody(req.body);
  if (!body) return res.status(400).json({ error: "invalid body" });
  if (!block.signature[body.lang] || !block.starterCode[body.lang]) {
    return res.status(400).json({ error: `lesson does not support ${body.lang}` });
  }
  try {
    const result = await submit(block, body.lang, body.code);
    if (result.sandboxError) {
      // Infrastructure failure — not a valid attempt; do not record it.
      return res.status(503).json({ error: result.sandboxError });
    }
    recordSubmission({
      userId,
      courseId: lesson.courseId,
      lessonId: lesson.id,
      language: body.lang,
      code: body.code,
      verdict: result.verdict,
      publicPassed: result.publicTests.filter((t) => t.passed).length,
      publicTotal: result.publicTests.length,
      privatePassed: result.privatePassed,
      privateTotal: result.privateTotal,
      compileError: result.compileError,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/** Reveal a code block's reference solution on demand (Show Solution). */
lessonsRouter.post("/:lessonId/solution", async (req, res) => {
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  const block = codeBlockOf(lesson);
  if (!block?.solution) {
    return res.status(404).json({ error: "no solution available" });
  }
  const body = parseBody(req.body);
  const lang = body?.lang ?? "javascript";
  res.json({
    solution: block.solution,
    lang,
    module: block.mode === "module" ? true : false,
  });
});
