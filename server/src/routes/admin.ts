import { NextFunction, Request, Response, Router } from "express";
import { config } from "../config";
import { getCourse, getCourses, getLoadErrors } from "../courses/loader";
import {
  getAdminStats,
  getCourseVisibilityMatrix,
  setCourseVisibility,
  userById,
} from "../db";

/** Owner-only telemetry: users, per-lesson solve/submission counts, load
 *  errors. Mounted behind the session gate; the owner check is by username. */
export const adminRouter = Router();

function requireOwner(req: Request, res: Response, next: NextFunction): void {
  // The session gate resolves req.userId but not the username; look it up.
  const u = req.userId ? userById(req.userId) : undefined;
  if (!u || u.username !== config.ownerUsername) {
    res.status(403).json({ error: "owner only" });
    return;
  }
  next();
}

adminRouter.get("/stats", requireOwner, (req, res) => {
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

/** Per-user course visibility matrix (default = visible; owner is exempt and
 *  reported as visible). Rows follow getCourses() order for table headers. */
adminRouter.get("/visibility", requireOwner, (req, res) => {
  const rows = getCourseVisibilityMatrix();
  const byUser = new Map<
    number,
    { id: number; username: string; isOwner: boolean; visible: Map<string, boolean> }
  >();
  for (const r of rows) {
    let u = byUser.get(r.userId);
    if (!u) {
      u = {
        id: r.userId,
        username: r.username,
        isOwner: r.username === config.ownerUsername,
        visible: new Map(),
      };
      byUser.set(r.userId, u);
    }
    // LEFT JOIN: courseId null = no rows = fully visible.
    if (r.courseId !== null) u.visible.set(r.courseId, r.visible === 1);
  }
  const users = [...byUser.values()].map((u) => ({
    id: u.id,
    username: u.username,
    isOwner: u.isOwner,
    courses: getCourses().map((c) => ({
      courseId: c.id,
      // The owner cannot be restricted; report (and require) visible.
      visible: u.isOwner ? true : (u.visible.get(c.id) ?? true),
    })),
  }));
  res.json({ users });
});

/** Set one user×course visibility cell. Owner rows are rejected — the owner
 *  always sees everything. */
adminRouter.put("/visibility", requireOwner, (req, res) => {
  const body = req.body as { userId?: unknown; courseId?: unknown; visible?: unknown };
  const userId = Number(body?.userId);
  const courseId = typeof body?.courseId === "string" ? body.courseId : "";
  const visible =
    body?.visible === true || body?.visible === false ? body.visible : null;
  if (!Number.isInteger(userId) || !courseId || visible === null) {
    return res.status(400).json({ error: "body must be { userId, courseId, visible }" });
  }
  const target = userById(userId);
  if (!target) return res.status(404).json({ error: "user not found" });
  if (target.username === config.ownerUsername) {
    return res.status(400).json({ error: "owner always has access" });
  }
  if (!getCourse(courseId)) {
    return res.status(404).json({ error: "course not found" });
  }
  setCourseVisibility(userId, courseId, visible);
  res.json({ ok: true });
});
