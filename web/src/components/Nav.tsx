import { Link } from "react-router-dom";
import { api } from "../api";
import type { User } from "../types";

export default function Nav({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <header className="nav">
      <Link to="/" className="brand">
        trucoder
      </Link>
      <div className="nav-right">
        <span className="nav-user">{user.username}</span>
        <button
          className="ghost"
          onClick={async () => {
            await api.logout().catch(() => {});
            onLogout();
          }}
        >
          sign out
        </button>
      </div>
    </header>
  );
}
