import { Router } from "express";
import { getCourse, getCourses, getSearchIndex } from "../courses/loader";
import { getMostRecentProgress, getProgressForLessons } from "../db";

export const coursesRouter = Router();

/** First unsolved lesson of a course (by order), if any. */
function nextLessonOf(
  progress: Map<string, { solved: number }>,
  lessons: { id: string; title: string; order: number }[]
): { id: string; title: string } | null {
  const unsolved = lessons.filter((l) => !progress.get(l.id)?.solved);
  return unsolved[0] ? { id: unsolved[0].id, title: unsolved[0].title } : null;
}

/**
 * "Continue where you left off": the most recently touched course first;
 * within it, the first unsolved lesson AT OR AFTER the lesson that was last
 * visited (falling back to the course's first unsolved lesson, then to any
 * other course with an unsolved lesson by recency). Null when every lesson
 * everywhere is solved.
 */
function continueTargetOf(userId: number) {
  const courses = getCourses();
  const recent = getMostRecentProgress(userId);
  const ordered = [...courses].sort((a, b) => {
    if (a.id === recent?.course_id) return -1;
    if (b.id === recent?.course_id) return 1;
    return 0;
  });
  for (const c of ordered) {
    const progress = getProgressForLessons(
      userId,
      c.id,
      c.lessons.map((l) => l.id)
    );
    let target = nextLessonOf(progress, c.lessons);
    if (target && c.id === recent?.course_id && recent) {
      // Prefer resuming after the last-visited lesson over jumping back to
      // an earlier skipped one.
      const lastOrder = c.lessons.find((l) => l.id === recent.lesson_id)?.order ?? 0;
      const after = c.lessons.find(
        (l) => !progress.get(l.id)?.solved && l.order >= lastOrder
      );
      if (after) target = { id: after.id, title: after.title };
    }
    if (target) {
      return {
        courseId: c.id,
        courseTitle: c.title,
        lessonId: target.id,
        lessonTitle: target.title,
      };
    }
  }
  return null;
}

/** List all courses with the requesting user's solved count and the first
 *  unsolved lesson (for "continue where you left off"). One progress query
 *  per course — not one per lesson. */
coursesRouter.get("/", (req, res) => {
  const userId = req.userId!;
  const courses = getCourses().map((c) => {
    const progress = getProgressForLessons(
      userId,
      c.id,
      c.lessons.map((l) => l.id)
    );
    let solved = 0;
    for (const l of c.lessons) {
      if (progress.get(l.id)?.solved) solved += 1;
    }
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      difficultyLevels: c.difficultyLevels,
      lessonCount: c.lessons.length,
      solved,
      nextLesson: nextLessonOf(progress, c.lessons),
      body: c.body,
    };
  });
  res.json({ courses, continue: continueTargetOf(userId) });
});

/** Compact content-search index for the command palette: per-lesson title +
 *  significant words (markdown, task, hints, quiz text). Built at scan time
 *  on the server so the client never fetches every lesson body. */
coursesRouter.get("/search", (_req, res) => {
  res.json({ lessons: getSearchIndex() });
});

/** A single course with per-lesson progress. */
coursesRouter.get("/:courseId", (req, res) => {
  const userId = req.userId!;
  const c = getCourse(req.params.courseId);
  if (!c) return res.status(404).json({ error: "course not found" });

  const progress = getProgressForLessons(
    userId,
    c.id,
    c.lessons.map((l) => l.id)
  );
  const lessons = c.lessons.map((l) => {
    const p = progress.get(l.id);
    return {
      id: l.id,
      title: l.title,
      difficulty: l.difficulty,
      order: l.order,
      tags: l.tags,
      hasExercise: l.hasExercise,
      solved: Boolean(p?.solved),
      attemptCount: p?.attempt_count ?? 0,
    };
  });

  res.json({
    id: c.id,
    title: c.title,
    description: c.description,
    difficultyLevels: c.difficultyLevels,
    body: c.body,
    lessons,
  });
});
