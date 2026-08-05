import { Router } from "express";
import { getCourse, getLesson } from "../courses/loader";
import type { Lang } from "../courses/types";
import { getProgress, markLessonRead, recordSubmission } from "../db";
import { runPublic, submit } from "../judge";

export const lessonsRouter = Router({ mergeParams: true });

function parseBody(body: unknown): { lang: Lang; code: string } | null {
  const b = body as { language?: unknown; code?: unknown };
  if (
    typeof b?.language !== "string" ||
    !["java", "javascript", "python"].includes(b.language)
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

/** Full lesson content for learning (public tests visible, private hidden). */
lessonsRouter.get("/:lessonId", (req, res) => {
  const userId = req.userId!;
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  const p = getProgress(userId, lesson.courseId, lesson.id);

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
    task: lesson.task,
    languages: lesson.languages,
    signature: lesson.signature,
    starterCode: lesson.starterCode,
    publicTests: lesson.publicTests,
    timeLimitMs: lesson.timeLimitMs,
    hints: lesson.hints,
    body: lesson.body,
    progress: {
      solved: Boolean(p?.solved),
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

function ensureSupported(lesson: ReturnType<typeof getLesson>, lang: Lang) {
  return (
    lesson &&
    lesson.signature[lang] &&
    lesson.starterCode[lang]
  );
}

/** Mark a content-only lesson as read (no coding exercise). */
lessonsRouter.post("/:lessonId/read", (req, res) => {
  const userId = req.userId!;
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  if (lesson.hasExercise) {
    return res
      .status(400)
      .json({ error: "this lesson has a coding exercise — solve it instead" });
  }
  markLessonRead(userId, courseId, lessonId);
  res.json({ solved: true });
});

/** Run the visible public tests (fast feedback while coding). */
lessonsRouter.post("/:lessonId/run", async (req, res) => {
  const { courseId, lessonId } = paramsOf(req);
  const lesson = getLesson(courseId, lessonId);
  if (!lesson) return res.status(404).json({ error: "lesson not found" });
  if (!lesson.hasExercise) {
    return res.status(400).json({ error: "this lesson has no coding exercise" });
  }
  const body = parseBody(req.body);
  if (!body) return res.status(400).json({ error: "invalid body" });
  if (!ensureSupported(lesson, body.lang)) {
    return res.status(400).json({ error: `lesson does not support ${body.lang}` });
  }
  try {
    res.json(await runPublic(lesson, body.lang, body.code));
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
  if (!lesson.hasExercise) {
    return res.status(400).json({ error: "this lesson has no coding exercise" });
  }
  const body = parseBody(req.body);
  if (!body) return res.status(400).json({ error: "invalid body" });
  if (!ensureSupported(lesson, body.lang)) {
    return res.status(400).json({ error: `lesson does not support ${body.lang}` });
  }
  try {
    const result = await submit(lesson, body.lang, body.code);
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
