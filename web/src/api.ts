import type {
  AnswerResult,
  CourseDetail,
  CourseSummary,
  Lang,
  Lesson,
  RunResult,
  SubmitResult,
  User,
} from "./types";

export class ApiError extends Error {}

async function parse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.error === "string" ? data.error : `HTTP ${res.status}`;
    if (res.status === 401) throw new ApiError("session expired");
    throw new ApiError(msg);
  }
  return data as T;
}

function get<T>(url: string): Promise<T> {
  return fetch(url, { credentials: "same-origin" }).then((r) => parse<T>(r));
}

function post<T>(url: string, body: unknown): Promise<T> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  }).then((r) => parse<T>(r));
}

export const api = {
  me: () => get<{ authenticated: boolean; user: User | null }>("/api/auth/me"),

  login: (username: string, password: string) =>
    post<{ user: User }>("/api/auth/login", { username, password }),

  logout: () => post<{ ok: boolean }>("/api/auth/logout", {}),

  courses: () => get<{ courses: CourseSummary[] }>("/api/courses"),

  course: (id: string) => get<CourseDetail>(`/api/courses/${id}`),

  lesson: (courseId: string, lessonId: string) =>
    get<Lesson>(`/api/courses/${courseId}/lessons/${lessonId}`),

  run: (courseId: string, lessonId: string, language: Lang, code: string) =>
    post<RunResult>(`/api/courses/${courseId}/lessons/${lessonId}/run`, {
      language,
      code,
    }),

  submit: (courseId: string, lessonId: string, language: Lang, code: string) =>
    post<SubmitResult>(`/api/courses/${courseId}/lessons/${lessonId}/submit`, {
      language,
      code,
    }),

  markRead: (courseId: string, lessonId: string) =>
    post<{ solved: boolean }>(
      `/api/courses/${courseId}/lessons/${lessonId}/read`,
      {}
    ),

  answer: (courseId: string, lessonId: string, blockId: number, answers: number[]) =>
    post<AnswerResult>(
      `/api/courses/${courseId}/lessons/${lessonId}/answer`,
      { blockId, answers }
    ),
};

/** Absolute URL for a course asset (image blocks). */
export function assetUrl(courseId: string, src: string): string {
  return `/api/assets/courses/${courseId}/${src}`;
}
