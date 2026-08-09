// Interviewer rich-content parsing: the model can embed quizzes in its
// messages with [[quiz]]…[[/quiz]] fences. The answer line is stripped from
// display but used for instant right/wrong feedback after the user answers.
export interface ChatQuiz {
  question: string;
  options: string[]; // full option text with the "A." prefix stripped
  answer: number; // index into options
}

const QUIZ_RE = /\[\[quiz\]\]([\s\S]*?)\[\[\/quiz\]\]/g;

export function parseQuizzes(content: string): { quizzes: ChatQuiz[]; text: string } {
  const quizzes: ChatQuiz[] = [];
  let answer: number = -1;
  let question = "";
  let rawOptions: string[] = [];

  const flush = () => {
    if (!question || rawOptions.length < 2) return;
    quizzes.push({
      question,
      options: rawOptions.map((o) => o.replace(/^[-*]\s*[A-Da-d][.)]\s*/, "").trim()),
      answer: answer >= 0 && answer < rawOptions.length ? answer : -1,
    });
    question = "";
    rawOptions = [];
    answer = -1;
  };

  let match;
  const seen = new Set<number>();
  while ((match = QUIZ_RE.exec(content)) !== null) {
    seen.add(match.index);
    const inner = match[1];
    for (const line of inner.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      const qm = t.match(/^q:\s*(.+)$/i);
      if (qm) {
        flush();
        question = qm[1].trim();
        continue;
      }
      const am = t.match(/^answer:\s*([A-Da-d])$/i);
      if (am) {
        answer = am[1].toUpperCase().charCodeAt(0) - 65;
        continue;
      }
      const om = t.match(/^[-*]\s*([A-Da-d])[.)]\s*(.+)$/);
      if (om) {
        rawOptions.push(om[0]);
      } else if (question && /^[-*]\s*/.test(t)) {
        rawOptions.push(t);
      }
    }
    flush();
  }

  // strip the quiz fences from the text (leaving any surrounding prose)
  let text = content
    .replace(QUIZ_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    // drop code fences left empty by a removed quiz
    .replace(/```[a-zA-Z0-9_-]*\s*```/g, "")
    .trim();
  return { quizzes, text };
}

export function letter(i: number): string {
  return String.fromCharCode(65 + i);
}
