/**
 * ChemVM — PDF lab report generator.
 * Uses pdf-lib (Worker-safe, no server round-trip) to render a full experiment
 * report matching the format required by the syllabus: student info, aim,
 * apparatus, chemicals, step transcript, observations, expected vs actual,
 * final assessment, mark, grade, and recommendations.
 */

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import type { SyllabusExperiment } from "@/lib/lab/experimentsCatalog";
import type { Reading, Criterion } from "@/lib/lab/markingEngine";

export interface ReportInput {
  student: { name: string; level: string; date: string };
  syllabus: { id: string; board: string; level: string };
  experiment: SyllabusExperiment;
  percent: number;
  grade: string;
  band: string;
  correct: { label: string }[];
  missed: { label: string }[];
  transcript: { ts: number; kind: string; label: string }[];
  observations: string[];
  readings?: Reading[];
  criteria?: Criterion[];
  rawScore?: number;
  rawTotal?: number;
}

/* ------------------------------------------------------------------
   WinAnsi safety.

   pdf-lib's StandardFonts are WinAnsi-encoded and throw on any character
   outside that set — including every superscript, subscript and reaction
   arrow used in chemistry. Since 84 of the 115 experiments contain such
   characters, report generation used to fail outright ("WinAnsi cannot
   encode ⁺"). Transliterate to a WinAnsi-safe equivalent before drawing.
------------------------------------------------------------------- */

const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-",
  "⁼": "=", "⁽": "(", "⁾": ")", "ⁿ": "n",
};

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
  "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-",
  "₌": "=", "₍": "(", "₎": ")", "ₙ": "n", "ₓ": "x",
};

const SYMBOLS: Record<string, string> = {
  "→": "->", "←": "<-", "↔": "<->", "⇌": "<=>", "⇋": "<=>", "⇒": "=>",
  "↑": "(g)", "↓": "(s)", "≡": "=", "≈": "~", "≠": "!=", "≤": "<=", "≥": ">=",
  "–": "-", "—": "-", "‑": "-", "‒": "-", "―": "-",
  "“": '"', "”": '"', "„": '"', "‘": "'", "’": "'", "‚": "'",
  "…": "...", "•": "-", "·": "-", "∙": "-", "◦": "-", "‧": "-",
  "×": "x", "÷": "/", "∆": "delta", "Δ": "delta", "√": "sqrt",
  "∞": "inf", "α": "alpha", "β": "beta", "γ": "gamma", "λ": "lambda",
  "μ": "u", "µ": "u", "π": "pi", "σ": "sigma", "ω": "omega", "Ω": "ohm",
  "‰": "o/oo", "™": "(TM)", "\u00a0": " ", "\u2009": " ", "\u202f": " ", "\u200b": "",
};

/** Convert a string to something the WinAnsi standard fonts can render. */
export function winAnsiSafe(input: string): string {
  if (!input) return "";
  let out = "";
  for (const ch of input) {
    const mapped = SUPERSCRIPTS[ch] ?? SUBSCRIPTS[ch] ?? SYMBOLS[ch];
    if (mapped !== undefined) { out += mapped; continue; }
    const code = ch.codePointAt(0) ?? 0;
    // Printable ASCII and the Latin-1 range are safe in WinAnsi.
    if (code === 9 || code === 10 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255)) {
      out += ch;
    } else {
      out += "?";
    }
  }
  return out;
}

const M = 48;
const NAVY = rgb(0.08, 0.16, 0.32);
const TURQ = rgb(0.14, 0.62, 0.62);
const RED = rgb(0.78, 0.28, 0.28);
const GREY = rgb(0.35, 0.35, 0.4);
const BG = rgb(0.97, 0.94, 0.88); // peach paper

interface Cursor { page: PDFPage; y: number; }

function newPage(doc: PDFDocument): PDFPage {
  const p = doc.addPage([595, 842]); // A4
  p.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: BG });
  return p;
}

function ensure(doc: PDFDocument, cur: Cursor, needed: number): Cursor {
  if (cur.y - needed < M) {
    return { page: newPage(doc), y: 842 - M };
  }
  return cur;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const trial = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(trial, size) > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else line = trial;
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(cur: Cursor, doc: PDFDocument, text: string, font: PDFFont, size: number, color = NAVY, indent = 0): Cursor {
  const maxW = 595 - M * 2 - indent;
  // Sanitize before measuring: font.widthOfTextAtSize throws on non-WinAnsi
  // characters just as drawText does.
  const lines = wrap(winAnsiSafe(text), font, size, maxW);
  let c = cur;
  for (const ln of lines) {
    c = ensure(doc, c, size + 4);
    c.page.drawText(winAnsiSafe(ln), { x: M + indent, y: c.y - size, size, font, color });
    c.y -= size + 4;
  }
  return c;
}

function heading(cur: Cursor, doc: PDFDocument, text: string, font: PDFFont): Cursor {
  let c = ensure(doc, cur, 30);
  c.y -= 8;
  c.page.drawText(winAnsiSafe(text.toUpperCase()), { x: M, y: c.y - 12, size: 11, font, color: TURQ });
  c.y -= 16;
  c.page.drawLine({ start: { x: M, y: c.y }, end: { x: 595 - M, y: c.y }, thickness: 0.6, color: TURQ });
  c.y -= 10;
  return c;
}

export async function generateReportPdf(input: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  let cur: Cursor = { page: newPage(doc), y: 842 - M };

  // Header band
  cur.page.drawRectangle({ x: 0, y: 842 - 90, width: 595, height: 90, color: NAVY });
  cur.page.drawText(winAnsiSafe("CHEMVM · LAB REPORT"), { x: M, y: 842 - 40, size: 10, font: bold, color: rgb(0.98, 0.88, 0.75) });
  cur.page.drawText(winAnsiSafe(input.experiment.title), { x: M, y: 842 - 62, size: 17, font: bold, color: rgb(1, 1, 1) });
  cur.page.drawText(winAnsiSafe(`Experiment #${input.experiment.id}  ·  ${input.syllabus.board} (${input.syllabus.level})`), {
    x: M, y: 842 - 80, size: 9, font, color: rgb(0.85, 0.9, 0.95),
  });
  cur.y = 842 - 110;

  // Student info block
  cur = ensure(doc, cur, 60);
  cur.page.drawRectangle({ x: M, y: cur.y - 56, width: 595 - M * 2, height: 56, color: rgb(1, 1, 1), borderColor: TURQ, borderWidth: 0.5 });
  const rowY = cur.y - 20;
  cur.page.drawText(winAnsiSafe("STUDENT"), { x: M + 12, y: rowY, size: 8, font: bold, color: TURQ });
  cur.page.drawText(winAnsiSafe(input.student.name || "—"), { x: M + 12, y: rowY - 14, size: 11, font: bold, color: NAVY });
  cur.page.drawText(winAnsiSafe("LEVEL"), { x: M + 220, y: rowY, size: 8, font: bold, color: TURQ });
  cur.page.drawText(winAnsiSafe(input.student.level || "—"), { x: M + 220, y: rowY - 14, size: 11, font: bold, color: NAVY });
  cur.page.drawText(winAnsiSafe("DATE"), { x: M + 380, y: rowY, size: 8, font: bold, color: TURQ });
  cur.page.drawText(winAnsiSafe(input.student.date), { x: M + 380, y: rowY - 14, size: 11, font: bold, color: NAVY });
  cur.y -= 68;

  // Score panel
  cur = ensure(doc, cur, 80);
  cur.page.drawRectangle({ x: M, y: cur.y - 72, width: 595 - M * 2, height: 72, color: NAVY });
  cur.page.drawText(winAnsiSafe("FINAL MARK"), { x: M + 16, y: cur.y - 20, size: 9, font: bold, color: rgb(0.85, 0.9, 0.95) });
  cur.page.drawText(winAnsiSafe(`${input.percent}%`), { x: M + 16, y: cur.y - 56, size: 36, font: bold, color: rgb(0.98, 0.88, 0.75) });
  cur.page.drawText(winAnsiSafe("GRADE"), { x: M + 180, y: cur.y - 20, size: 9, font: bold, color: rgb(0.85, 0.9, 0.95) });
  cur.page.drawText(winAnsiSafe(input.grade), { x: M + 180, y: cur.y - 44, size: 20, font: bold, color: rgb(1, 1, 1) });
  cur.page.drawText(winAnsiSafe(input.band), { x: M + 180, y: cur.y - 60, size: 9, font: italic, color: rgb(0.85, 0.9, 0.95) });
  if (input.rawTotal) {
    cur.page.drawText(winAnsiSafe(`${input.rawScore} / ${input.rawTotal} weighted marks`), {
      x: M + 320, y: cur.y - 40, size: 10, font, color: rgb(0.85, 0.9, 0.95),
    });
  }
  cur.y -= 84;

  // Aim
  cur = heading(cur, doc, "Aim", bold);
  cur = drawText(cur, doc, input.experiment.objective || input.experiment.title, font, 10);

  // Apparatus & chemicals
  if (input.experiment.materials?.length) {
    cur = heading(cur, doc, "Apparatus", bold);
    cur = drawText(cur, doc, input.experiment.materials.join(", "), font, 10);
  }
  if (input.experiment.requiredChemicalIds?.length) {
    cur = heading(cur, doc, "Chemicals / Reagents", bold);
    cur = drawText(cur, doc, input.experiment.requiredChemicalIds.join(", "), font, 10);
  }

  // Procedure (expected)
  if (input.experiment.steps?.length) {
    cur = heading(cur, doc, "Expected Procedure", bold);
    input.experiment.steps.forEach((s, i) => {
      cur = drawText(cur, doc, `${i + 1}. ${s}`, font, 10, NAVY, 6);
    });
  }

  // Transcript of student actions
  cur = heading(cur, doc, "Actions Performed (Transcript)", bold);
  if (input.transcript.length === 0) {
    cur = drawText(cur, doc, "No actions were recorded.", italic, 10, GREY);
  } else {
    input.transcript.slice().reverse().forEach((t, i) => {
      const time = new Date(t.ts).toLocaleTimeString();
      cur = drawText(cur, doc, `${String(i + 1).padStart(2, "0")}. [${time}] ${t.label}`, font, 9, NAVY, 6);
    });
  }

  // Table of results
  if (input.readings?.length) {
    cur = heading(cur, doc, "Table of Results", bold);
    cur = ensure(doc, cur, 16);
    cur.page.drawText(winAnsiSafe("#   VESSEL / ACTION            T(°C)   VOL(ml)   pH      OBSERVATION"), {
      x: M, y: cur.y - 9, size: 8, font: bold, color: TURQ,
    });
    cur.y -= 16;
    input.readings.forEach((r, i) => {
      cur = ensure(doc, cur, 14);
      const head = `${String(i + 1).padStart(2, "0")}  ${r.vessel} — ${r.action}`.slice(0, 40).padEnd(42, " ");
      const nums = `${String(r.temperature).padEnd(8)}${String(r.volume).padEnd(10)}${String(r.pH).padEnd(8)}`;
      cur.page.drawText(winAnsiSafe(head + nums), { x: M, y: cur.y - 9, size: 8, font, color: NAVY });
      cur.y -= 11;
      cur = drawText(cur, doc, r.observation, italic, 8, GREY, 16);
    });
  }

  // Observations
  cur = heading(cur, doc, "Observations", bold);
  if (input.observations.length === 0) {
    cur = drawText(cur, doc, "No observations recorded.", italic, 10, GREY);
  } else {
    input.observations.forEach((o, i) => {
      cur = drawText(cur, doc, `- ${o}`, font, 10, NAVY, 6);
    });
  }

  // Expected result
  if (input.experiment.expectedResult) {
    cur = heading(cur, doc, "Expected Result", bold);
    cur = drawText(cur, doc, input.experiment.expectedResult, font, 10);
  }

  // Mark scheme
  if (input.criteria?.length) {
    cur = heading(cur, doc, "Mark Scheme Breakdown", bold);
    input.criteria.forEach((c) => {
      cur = drawText(
        cur, doc,
        `${c.achieved ? "[+]" : "[-]"} ${c.label} — ${c.achieved ? c.weightedMarks : 0}/${c.weightedMarks}`,
        font, 9, c.achieved ? TURQ : RED, 6,
      );
    });
  }

  // Assessment
  cur = heading(cur, doc, "Assessment — Correct", bold);
  if (input.correct.length === 0) cur = drawText(cur, doc, "Nothing scored.", italic, 10, GREY);
  else input.correct.forEach((c) => { cur = drawText(cur, doc, `[+] ${c.label}`, font, 10, TURQ, 6); });

  cur = heading(cur, doc, "Assessment — Missed / Incorrect", bold);
  if (input.missed.length === 0) cur = drawText(cur, doc, "Nothing missed.", italic, 10, GREY);
  else input.missed.forEach((c) => { cur = drawText(cur, doc, `[-] ${c.label}`, font, 10, RED, 6); });

  // Recommendations
  cur = heading(cur, doc, "Recommendations", bold);
  const recs = input.missed.length
    ? input.missed.slice(0, 5).map((m) => `Revisit: ${m.label}`)
    : ["Excellent work — attempt the next experiment in the syllabus."];
  recs.forEach((r) => { cur = drawText(cur, doc, `-> ${r}`, font, 10, NAVY, 6); });

  // Summary
  cur = heading(cur, doc, "Summary", bold);
  const summary =
    `Student ${input.student.name || "(unnamed)"} attempted experiment #${input.experiment.id} — ${input.experiment.title} ` +
    `under the ${input.syllabus.board} ${input.syllabus.level} syllabus and achieved ${input.percent}% (${input.grade}). ` +
    `${input.correct.length} checkpoint(s) satisfied, ${input.missed.length} missed.`;
  cur = drawText(cur, doc, summary, font, 10);

  // Footer on every page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(winAnsiSafe(`ChemVM · Generated ${new Date().toLocaleString()}`), { x: M, y: 24, size: 8, font, color: GREY });
    p.drawText(winAnsiSafe(`Page ${i + 1} of ${pages.length}`), { x: 595 - M - 60, y: 24, size: 8, font, color: GREY });
  });

  return await doc.save();
}

export function downloadReportPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
