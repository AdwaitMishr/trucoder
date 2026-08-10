import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

// tldraw is heavy — this module is lazy-loaded only when the blackboard opens.
export default function TldrawCanvas({
  onMount,
}: {
  onMount: (editor: unknown) => void;
}) {
  return (
    <Tldraw
      persistenceKey="trucoder-blackboard"
      onMount={(editor) => {
        // match the app's dark chrome (theme is an editor preference in v3)
        (editor as { user: { updateUserPreferences: (p: { colorScheme: string }) => void } }).user.updateUserPreferences({ colorScheme: "dark" });
        onMount(editor);
      }}
      options={{ maxPages: 1 }}
    />
  );
}
