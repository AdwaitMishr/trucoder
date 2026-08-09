// Client-side resume parsing — the resume never leaves the browser.
import * as pdfjs from "pdfjs-dist";
// Bundle the pdf.js worker as a same-origin asset (Vite ?url) — no CDN, so the
// worker stays local like everything else in this feature.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export async function parseResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parsePdf(file);
  if (name.endsWith(".docx") || name.endsWith(".doc")) return parseDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md")) return file.text();
  throw new Error("unsupported file type — use PDF, DOCX, or plain text");
}

async function parsePdf(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const text = await page.getTextContent();
    out +=
      text.items
        .map((it) => (it as { str?: string }).str ?? "")
        .join(" ") + "\n";
  }
  return out.trim();
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value ?? "").trim();
}
