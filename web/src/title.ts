import { useEffect } from "react";

/** Set the browser tab title to "<page> • trucoder". Call with the page's
 *  own label (course title, lesson title, ...); pass nothing for the bare
 *  wordmark. */
export function useDocumentTitle(page?: string | null): void {
  useEffect(() => {
    document.title = page ? `${page} • trucoder` : "trucoder";
  }, [page]);
}
