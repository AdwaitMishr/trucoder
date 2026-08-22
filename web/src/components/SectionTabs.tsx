import { NavLink } from "react-router-dom";
import { PiBookOpen, PiChatCircle } from "react-icons/pi";

/** Section tabs (courses | interviews) — lives under the page head on the
 *  two index pages. Navigation itself is the ⌘K palette; this row only
 *  provides at-a-glance context for where you are. */
export default function SectionTabs() {
  return (
    <nav className="section-tabs" aria-label="sections">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `section-tab ${isActive ? "active" : ""}`}
      >
        <PiBookOpen size={14} />
        <span>courses</span>
      </NavLink>
      <NavLink
        to="/interviews"
        className={({ isActive }) => `section-tab ${isActive ? "active" : ""}`}
      >
        <PiChatCircle size={14} />
        <span>interviews</span>
      </NavLink>
    </nav>
  );
}
