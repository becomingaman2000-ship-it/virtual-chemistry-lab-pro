/**
 * ChemVM — PDF lab report generator.
 * Uses pdf-lib (Worker-safe, no server round-trip) to render a full experiment
 * report matching the format required by the syllabus: student info, aim,
 * apparatus, chemicals, step transcript, observations, expected vs actual,
 * final assessment, mark, grade, and recommendations.
 */

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import type { SyllabusExperiment } from "@/lib/lab/experimentsCatalog";

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
  const lines = wrap(text, font, size, maxW);
  let c = cur;
  for (const ln of lines) {
    c = ensure(doc, c, size + 4);
    c.page.drawText(ln, { x: M + indent, y: c.y - size, size, font, color });
    c.y -= size + 4;
  }
  return c;
}

function heading(cur: Cursor, doc: PDFDocument, text: string, font: PDFFont): Cursor {
  let c = ensure(doc, cur, 30);
  c.y -= 8;
  c.page.drawText(text.toUpperCase(), { x: M, y: c.y - 12, size: 11, font, color: TURQ });
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
  cur.page.drawText("CHEMVM · LAB REPORT", { x: M, y: 842 - 40, size: 10, font: bold, color: rgb(0.98, 0.88, 0.75) });
  cur.page.drawText(input.experiment.title, { x: M, y: 842 - 62, size: 17, font: bold, color: rgb(1, 1, 1) });
  cur.page.drawText(`Experiment #${input.experiment.id}  ·  ${input.syllabus.board} (${input.syllabus.level})`, {
    x: M, y: 842 - 80, size: 9, font, color: rgb(0.85, 0.9, 0.95),
  });
  cur.y = 842 - 110;

  // Student info block
  cur = ensure(doc, cur, 60);
  cur.page.drawRectangle({ x: M, y: cur.y - 56, width: 595 - M * 2, height: 56, color: rgb(1, 1, 1), borderColor: TURQ, borderWidth: 0.5 });
  const rowY = cur.y - 20;
  cur.page.drawText("STUDENT", { x: M + 12, y: rowY, size: 8, font: bold, color: TURQ });
  cur.page.drawText(input.student.name || "—", { x: M + 12, y: rowY - 14, size: 11, font: bold, color: NAVY });
  cur.page.drawText("LEVEL", { x: M + 220, y: rowY, size: 8, font: bold, color: TURQ });
  cur.page.drawText(input.student.level || "—", { x: M + 220, y: rowY - 14, size: 11, font: bold, color: NAVY });
  cur.page.drawText("DATE", { x: M + 380, y: rowY, size: 8, font: bold, color: TURQ });
  cur.page.drawText(input.student.date, { x: M + 380, y: rowY - 14, size: 11, font: bold, color: NAVY });
  cur.y -= 68;

  // Score panel
  cur = ensure(doc, cur, 80);
  cur.page.drawRectangle({ x: M, y: cur.y - 72, width: 595 - M * 2, height: 72, color: NAVY });
  cur.page.drawText("FINAL MARK", { x: M + 16, y: cur.y - 20, size: 9, font: bold, color: rgb(0.85, 0.9, 0.95) });
  cur.page.drawText(`${input.percent}%`, { x: M + 16, y: cur.y - 56, size: 36, font: bold, color: rgb(0.98, 0.88, 0.75) });
  cur.page.drawText("GRADE", { x: M + 180, y: cur.y - 20, size: 9, font: bold, color: rgb(0.85, 0.9, 0.95) });
  cur.page.drawText(input.grade, { x: M + 180, y: cur.y - 44, size: 20, font: bold, color: rgb(1, 1, 1) });
  cur.page.drawText(input.band, { x: M + 180, y: cur.y - 60, size: 9, font: italic, color: rgb(0.85, 0.9, 0.95) });
  cur.y -= 84;

  // Aim
  cur = heading(cur, doc, "Aim", bold);
  cur = drawText(cur, doc, input.experiment.aim || input.experiment.title, font, 10);

  // Apparatus & chemicals
  if (input.experiment.requiredApparatusIds?.length) {
    cur = heading(cur, doc, "Apparatus", bold);
    cur = drawText(cur, doc, input.experiment.requiredApparatusIds.join(", "), font, 10);
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

  // Observations
  cur = heading(cur, doc, "Observations", bold);
  if (input.observations.length === 0) {
    cur = drawText(cur, doc, "No observations recorded.", italic, 10, GREY);
  } else {
    input.observations.forEach((o, i) => {
      cur = drawText(cur, doc, `• ${o}`, font, 10, NAVY, 6);
    });
  }

  // Expected result
  if (input.experiment.expectedResult) {
    cur = heading(cur, doc, "Expected Result", bold);
    cur = drawText(cur, doc, input.experiment.expectedResult, font, 10);
  }

  // Assessment
  cur = heading(cur, doc, "Assessment — Correct", bold);
  if (input.correct.length === 0) cur = drawText(cur, doc, "Nothing scored.", italic, 10, GREY);
  else input.correct.forEach((c) => { cur = drawText(cur, doc, `✓ ${c.label}`, font, 10, TURQ, 6); });

  cur = heading(cur, doc, "Assessment — Missed / Incorrect", bold);
  if (input.missed.length === 0) cur = drawText(cur, doc, "Nothing missed.", italic, 10, GREY);
  else input.missed.forEach((c) => { cur = drawText(cur, doc, `✗ ${c.label}`, font, 10, RED, 6); });

  // Recommendations
  cur = heading(cur, doc, "Recommendations", bold);
  const recs = input.missed.length
    ? input.missed.slice(0, 5).map((m) => `Revisit: ${m.label}`)
    : ["Excellent work — attempt the next experiment in the syllabus."];
  recs.forEach((r) => { cur = drawText(cur, doc, `→ ${r}`, font, 10, NAVY, 6); });

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
    p.drawText(`ChemVM · Generated ${new Date().toLocaleString()}`, { x: M, y: 24, size: 8, font, color: GREY });
    p.drawText(`Page ${i + 1} of ${pages.length}`, { x: 595 - M - 60, y: 24, size: 8, font, color: GREY });
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
