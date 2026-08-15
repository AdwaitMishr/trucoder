import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useTheme } from "../theme";

// tldraw is heavy — this module is lazy-loaded only when the blackboard opens.
export default function TldrawCanvas({
  onMount,
}: {
  onMount: (editor: unknown) => void;
}) {
  const { theme } = useTheme();
  return (
    <Tldraw
      persistenceKey="trucoder-blackboard"
      onMount={(editor) => {
        // follow the app's active theme (light or dark)
        (editor as { user: { updateUserPreferences: (p: { colorScheme: string }) => void } }).user.updateUserPreferences({ colorScheme: theme.kind });
        onMount(editor);
      }}
      options={{ maxPages: 1 }}
    />
  );
}
