import { Router } from "express";
import { getCourse, getCourses, getSearchIndex } from "../courses/loader";
import { getProgressForLessons } from "../db";

export const coursesRouter = Router();

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
    let nextLesson: { id: string; title: string } | null = null;
    for (const l of c.lessons) {
      if (progress.get(l.id)?.solved) {
        solved += 1;
      } else if (!nextLesson) {
        nextLesson = { id: l.id, title: l.title };
      }
    }
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      difficultyLevels: c.difficultyLevels,
      lessonCount: c.lessons.length,
      solved,
      nextLesson,
      body: c.body,
    };
  });
  res.json({ courses });
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
