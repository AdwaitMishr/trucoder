import { Router } from "express";
import { getCourse, getCourses } from "../courses/loader";
import { getProgress } from "../db";

export const coursesRouter = Router();

/** List all courses with the requesting user's solved count. */
coursesRouter.get("/", (req, res) => {
  const userId = req.userId!;
  const courses = getCourses().map((c) => {
    let solved = 0;
    for (const l of c.lessons) {
      if (getProgress(userId, c.id, l.id)?.solved) solved += 1;
    }
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      difficultyLevels: c.difficultyLevels,
      lessonCount: c.lessons.length,
      solved,
      body: c.body,
    };
  });
  res.json({ courses });
});

/** A single course with per-lesson progress. */
coursesRouter.get("/:courseId", (req, res) => {
  const userId = req.userId!;
  const c = getCourse(req.params.courseId);
  if (!c) return res.status(404).json({ error: "course not found" });

  const lessons = c.lessons.map((l) => {
    const p = getProgress(userId, c.id, l.id);
    return {
      id: l.id,
      title: l.title,
      difficulty: l.difficulty,
      order: l.order,
      tags: l.tags,
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
