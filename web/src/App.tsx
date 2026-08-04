import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api";
import type { User } from "./types";
import Login from "./components/Login";
import Nav from "./components/Nav";
import CourseDashboard from "./components/CourseDashboard";
import LessonView from "./components/LessonView";

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return <div className="boot">trucoder</div>;
  }

  return (
    <>
      {user && <Nav user={user} onLogout={() => setUser(null)} />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
        />
        <Route
          path="/"
          element={user ? <CourseDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/course/:courseId/lessons/:lessonId"
          element={user ? <LessonView /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}
