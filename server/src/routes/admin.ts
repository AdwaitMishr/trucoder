import { Router } from "express";
import { config } from "../config";
import { getCourses, getLoadErrors } from "../courses/loader";
import { getAdminStats, userById } from "../db";

/** Owner-only telemetry: users, per-lesson solve/submission counts, load
 *  errors. Mounted behind the session gate; the owner check is by username. */
export const adminRouter = Router();

adminRouter.get("/stats", (req, res) => {
  // The session gate resolves req.userId but not the username; look it up.
  const u = userById(req.userId as number);
  if (!u || u.username !== config.ownerUsername) {
    return res.status(403).json({ error: "owner only" });
  }
  const stats = getAdminStats();
  const solvedByLesson = new Map(
    stats.solvedByLesson.map((r) => [`${r.course_id}/${r.lesson_id}`, r.n])
  );
  const submissionsByLesson = new Map(
    stats.submissionsByLesson.map((r) => [`${r.course_id}/${r.lesson_id}`, r.n])
  );
  const courses = getCourses().map((c) => ({
    id: c.id,
    title: c.title,
    lessons: c.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      hasExercise: l.hasExercise,
      solvedUsers: solvedByLesson.get(`${c.id}/${l.id}`) ?? 0,
      submissions: submissionsByLesson.get(`${c.id}/${l.id}`) ?? 0,
    })),
  }));
  res.json({
    users: stats.users,
    courses,
    totals: {
      users: stats.users.length,
      submissions: stats.submissionCount,
      attempts: stats.attemptTotal,
    },
    loadErrors: getLoadErrors(),
  });
});
