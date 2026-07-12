/**
 * ChemVM — Syllabus Library
 *
 * Sourced from the ChemVM Research Desk reports:
 *   • African_Chemistry_Practical_Syllabuses_Report.pdf  (Vol. I — ZIMSEC,
 *     Cambridge, WAEC/NECO, KNEC, NECTA, UNEB, DBE/NSC, ECZ, MANEB, ESEC,
 *     Egypt, Morocco/Tunisia/Algeria).
 *   • African_Chemistry_Practicals_Remaining_Countries.pdf  (Vol. II —
 *     Rwanda REB/NESA, Cameroon GCE + Bac, Sudan, Ethiopia, Angola,
 *     Mozambique, DRC EXETAT, Congo-Brazzaville, Senegal + Francophone
 *     West-Africa cluster, Madagascar).
 *
 * A syllabus defines how criterion-referenced marks from an experiment's
 * rubric convert into a final grade. The rubric in experiments.ts stays
 * neutral; each syllabus here:
 *   1. Re-weights action categories via `weights`.
 *   2. Maps the final percentage onto its own grade band.
 *   3. Filters which experiments appear at each level / topic.
 *   4. Declares whether the board actually runs a hands-on practical paper
 *      or examines practical skills only in writing — ChemVM still trains
 *      the bench work for the latter, but the report format shifts to a
 *      "written-scenario" template.
 */

import type { ActionKind } from "./experiments";

export type Region =
  | "Southern Africa"
  | "East Africa"
  | "West Africa"
  | "Central Africa"
  | "North Africa"
  | "International";

export type Board =
  | "ZIMSEC"
  | "Cambridge"
  | "WAEC"
  | "NECO"
  | "KNEC"
  | "NECTA"
  | "UNEB"
  | "DBE"
  | "ECZ"
  | "MANEB"
  | "ESEC"
  | "REB/NESA"
  | "Cameroon GCE"
  | "Cameroon Bac"
  | "Sudan MoE"
  | "EAES"
  | "INADE"
  | "INECE"
  | "EXETAT"
  | "Congo Bac"
  | "Senegal Bac"
  | "Madagascar Bac"
  | "Thanaweya Amma"
  | "Maghreb Bac";

export type Level = "O-Level" | "A-Level";

/** How practical skill is actually examined by this board. */
export type PracticalMode =
  | "standalone"        // dedicated hands-on lab paper (ZIMSEC P3, Cambridge P3, WAEC, KNEC, etc.)
  | "alternative"       // written "alternative to practical" paper
  | "written-scenario"  // practical skill tested only via written questions (Egypt, Bac, Ethiopia…)
  | "school-based";     // school-graded coursework, no central practical paper

export interface GradeBand {
  grade: string;
  min: number; // inclusive %
  descriptor: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  /** experiment ids from src/data/experiments.ts that satisfy this topic */
  experiments: string[];
}

export interface Syllabus {
  id: string;
  board: Board;
  region: Region;
  country: string;
  level: Level;
  code: string;         // e.g. "5070", "9701", "4024"
  title: string;
  year: string;
  summary: string;
  practicalMode: PracticalMode;
  /** multipliers per action kind — 1.0 = neutral. Applied at report time. */
  weights: Record<ActionKind, number>;
  /** additional bonus for concordant / precise measurements */
  precisionBonus: number;
  /** grade bands sorted descending by min */
  grades: GradeBand[];
  topics: SyllabusTopic[];
  reportFormat: {
    sections: string[];
    signatureRequired: boolean;
    showRawMarks: boolean;
  };
}

const neutral: Record<ActionKind, number> = {
  place: 1, add: 1, heat: 1, cool: 1, stir: 1, pour: 1,
  filter: 1, measure: 1, observe: 1, safety: 1,
};

// Common grade band presets
const ukStyle: GradeBand[] = [
  { grade: "A*", min: 85, descriptor: "Exceptional — precise, complete, well-reasoned" },
  { grade: "A",  min: 75, descriptor: "Excellent practical technique" },
  { grade: "B",  min: 65, descriptor: "Very good with minor imprecision" },
  { grade: "C",  min: 55, descriptor: "Competent — the pass standard" },
  { grade: "D",  min: 45, descriptor: "Below expected — several omissions" },
  { grade: "E",  min: 35, descriptor: "Marginal" },
  { grade: "U",  min: 0,  descriptor: "Ungraded" },
];

const cieALevel: GradeBand[] = [
  { grade: "A*", min: 88, descriptor: "Exceptional — publication-quality technique" },
  { grade: "A",  min: 78, descriptor: "Excellent, precise, well-analysed" },
  { grade: "B",  min: 68, descriptor: "Strong practical and analytical work" },
  { grade: "C",  min: 58, descriptor: "Competent A-Level standard" },
  { grade: "D",  min: 48, descriptor: "Below expected" },
  { grade: "E",  min: 40, descriptor: "Marginal pass" },
  { grade: "U",  min: 0,  descriptor: "Ungraded" },
];

const zimsecBands: GradeBand[] = [
  { grade: "A", min: 75, descriptor: "Distinction — highly competent practical work" },
  { grade: "B", min: 65, descriptor: "Very good practical technique" },
  { grade: "C", min: 55, descriptor: "Competent — meets the standard" },
  { grade: "D", min: 45, descriptor: "Adequate with minor omissions" },
  { grade: "E", min: 35, descriptor: "Marginal — key steps missed" },
  { grade: "U", min: 0,  descriptor: "Ungraded — repeat the practical" },
];

const waecBands: GradeBand[] = [
  { grade: "A1", min: 75, descriptor: "Excellent" },
  { grade: "B2", min: 70, descriptor: "Very good" },
  { grade: "B3", min: 65, descriptor: "Good" },
  { grade: "C4", min: 60, descriptor: "Credit" },
  { grade: "C5", min: 55, descriptor: "Credit" },
  { grade: "C6", min: 50, descriptor: "Credit" },
  { grade: "D7", min: 45, descriptor: "Pass" },
  { grade: "E8", min: 40, descriptor: "Pass" },
  { grade: "F9", min: 0,  descriptor: "Fail" },
];

const nscBands: GradeBand[] = [
  { grade: "7 (Distinction)", min: 80, descriptor: "Outstanding achievement" },
  { grade: "6 (Meritorious)", min: 70, descriptor: "Meritorious achievement" },
  { grade: "5 (Substantial)", min: 60, descriptor: "Substantial achievement" },
  { grade: "4 (Adequate)",    min: 50, descriptor: "Adequate achievement" },
  { grade: "3 (Moderate)",    min: 40, descriptor: "Moderate achievement" },
  { grade: "2 (Elementary)",  min: 30, descriptor: "Elementary achievement" },
  { grade: "1 (Not achieved)", min: 0, descriptor: "Not achieved" },
];

const percentBands: GradeBand[] = [
  { grade: "Excellent", min: 85, descriptor: "Excellent practical performance" },
  { grade: "Very Good", min: 70, descriptor: "Very good — most criteria met" },
  { grade: "Good",      min: 55, descriptor: "Meets the standard" },
  { grade: "Pass",      min: 40, descriptor: "Marginal pass" },
  { grade: "Fail",      min: 0,  descriptor: "Below the required standard" },
];

const bacBands: GradeBand[] = [
  { grade: "Très Bien",  min: 80, descriptor: "Très bien — sortie avec les félicitations" },
  { grade: "Bien",       min: 70, descriptor: "Bien" },
  { grade: "Assez Bien", min: 60, descriptor: "Assez bien" },
  { grade: "Passable",   min: 50, descriptor: "Passable" },
  { grade: "Insuffisant", min: 0, descriptor: "Insuffisant — non admis" },
];

// Shared topic sets keyed by experiment ids in src/data/experiments.ts
const oLevelTopics: SyllabusTopic[] = [
  { id: "acids-bases", title: "Acids, Bases & Salts", experiments: ["acid-base-titration", "cuso4-crystals"] },
  { id: "qual",        title: "Qualitative Analysis", experiments: ["flame-tests"] },
];

const aLevelTopics: SyllabusTopic[] = [
  { id: "vol",     title: "Volumetric Analysis",   experiments: ["acid-base-titration"] },
  { id: "electro", title: "Electrochemistry",      experiments: ["electrolysis-cuso4"] },
  { id: "sep",     title: "Separation & Purification", experiments: ["ethanol-distillation", "cuso4-crystals"] },
  { id: "qual",    title: "Qualitative Analysis",  experiments: ["flame-tests"] },
];

const writtenScenarioReport = {
  sections: ["Scenario", "Apparatus & Reagents Chosen", "Expected Observations", "Calculations", "Sources of Error", "Conclusion"],
  signatureRequired: false,
  showRawMarks: false,
};

export const SYLLABI: Syllabus[] = [
  // ─── ZIMBABWE ───────────────────────────────────────────────────────────
  {
    id: "zimsec-o-4024",
    board: "ZIMSEC",
    region: "Southern Africa",
    country: "Zimbabwe",
    level: "O-Level",
    code: "4024",
    title: "ZIMSEC O-Level Chemistry",
    year: "2024–2027",
    summary:
      "Zimbabwe School Examinations Council O-Level Chemistry. Paper 3 (Practical Test) or Paper 4 (Alternative to Practical). Rewards safe technique, correct apparatus set-up, and clear recording of observations.",
    practicalMode: "standalone",
    weights: { ...neutral, safety: 1.5, place: 1.2, observe: 1.2, measure: 0.9 },
    precisionBonus: 0,
    grades: zimsecBands,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Chemicals", "Procedure", "Observations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "zimsec-a-6033",
    board: "ZIMSEC",
    region: "Southern Africa",
    country: "Zimbabwe",
    level: "A-Level",
    code: "6033",
    title: "ZIMSEC A-Level Chemistry",
    year: "2024–2027",
    summary:
      "Advanced Level Chemistry (Zimbabwe). Practical assessment emphasises planning, accurate measurement and analytical reasoning.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.4, observe: 1.2, safety: 1.1 },
    precisionBonus: 0.05,
    grades: zimsecBands,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Hypothesis", "Apparatus", "Method", "Results Table", "Calculations", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },

  // ─── CAMBRIDGE INTERNATIONAL ────────────────────────────────────────────
  {
    id: "cie-o-5070",
    board: "Cambridge",
    region: "International",
    country: "International (used across Africa)",
    level: "O-Level",
    code: "5070",
    title: "Cambridge O-Level Chemistry",
    year: "2024–2026",
    summary:
      "Cambridge Assessment International Education O-Level Chemistry. Paper 4 (Practical Test) rewards accurate observation, precise measurement and correct handling of apparatus.",
    practicalMode: "standalone",
    weights: { ...neutral, observe: 1.3, measure: 1.3, safety: 1.1 },
    precisionBonus: 0.03,
    grades: ukStyle,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Method Summary", "Results", "Observations", "Conclusion", "Sources of Error"],
      signatureRequired: false,
      showRawMarks: false,
    },
  },
  {
    id: "cie-a-9701",
    board: "Cambridge",
    region: "International",
    country: "International (used across Africa)",
    level: "A-Level",
    code: "9701",
    title: "Cambridge A-Level Chemistry",
    year: "2024–2026",
    summary:
      "Cambridge Advanced Level Chemistry. Paper 3 (Advanced Practical) and Paper 5 (Planning & Analysis) reward experimental design, precision, and evidence-based conclusions.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.5, observe: 1.3, place: 1.1 },
    precisionBonus: 0.08,
    grades: cieALevel,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Planning", "Apparatus & Reagents", "Method", "Risk Assessment", "Results Table", "Processed Data", "Uncertainty Analysis", "Discussion", "Conclusion", "Evaluation"],
      signatureRequired: false,
      showRawMarks: false,
    },
  },

  // ─── WEST AFRICA — WAEC / NECO ──────────────────────────────────────────
  {
    id: "waec-o",
    board: "WAEC",
    region: "West Africa",
    country: "Nigeria · Ghana · Sierra Leone · Liberia · Gambia",
    level: "O-Level",
    code: "WASSCE Chem P3",
    title: "WAEC WASSCE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "West African Senior School Certificate Examination. Paper 3 is a hands-on lab practical: titration + qualitative analysis of an unknown salt. Marking guides break credit down step-by-step, not just on the final number.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.4, observe: 1.3, safety: 1.0 },
    precisionBonus: 0.05,
    grades: waecBands,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Procedure", "Results Table", "Observations", "Inferences", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "neco-o",
    board: "NECO",
    region: "West Africa",
    country: "Nigeria",
    level: "O-Level",
    code: "SSCE Chem P3",
    title: "NECO SSCE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "National Examinations Council (Nigeria). Structurally near-identical to WAEC's practical paper — titration and qualitative analysis of an unknown, with step-by-step credit for method as well as answer.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.4, observe: 1.3, safety: 1.0 },
    precisionBonus: 0.05,
    grades: waecBands,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Procedure", "Results Table", "Observations", "Inferences", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },

  // ─── EAST AFRICA ────────────────────────────────────────────────────────
  {
    id: "knec-o",
    board: "KNEC",
    region: "East Africa",
    country: "Kenya",
    level: "O-Level",
    code: "233/3",
    title: "KNEC KCSE Chemistry Paper 3 (Practical)",
    year: "2024–2026",
    summary:
      "Kenya Certificate of Secondary Education. Paper 3 is a hands-on practical (~2h 15m, 40 marks). Two questions typically: a quantitative titration/rates task and a qualitative analysis of an unknown.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.35, observe: 1.3, safety: 1.0 },
    precisionBonus: 0.04,
    grades: [
      { grade: "A",  min: 80, descriptor: "Excellent" },
      { grade: "A-", min: 75, descriptor: "Very good" },
      { grade: "B+", min: 70, descriptor: "Good" },
      { grade: "B",  min: 65, descriptor: "Good" },
      { grade: "B-", min: 60, descriptor: "Above average" },
      { grade: "C+", min: 55, descriptor: "Above average" },
      { grade: "C",  min: 50, descriptor: "Average" },
      { grade: "C-", min: 45, descriptor: "Below average" },
      { grade: "D+", min: 40, descriptor: "Below average" },
      { grade: "D",  min: 35, descriptor: "Weak" },
      { grade: "D-", min: 30, descriptor: "Weak" },
      { grade: "E",  min: 0,  descriptor: "Very weak" },
    ],
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus", "Procedure", "Results Table", "Observations", "Inferences", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "necta-csee",
    board: "NECTA",
    region: "East Africa",
    country: "Tanzania",
    level: "O-Level",
    code: "032/3",
    title: "NECTA CSEE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Certificate of Secondary Education Examination (Form 4). Standalone practical paper with qualitative analysis marked in two stages — plausible-ion identification and confirmatory-test conclusion — per the QAG's marking logic.",
    practicalMode: "standalone",
    weights: { ...neutral, observe: 1.35, measure: 1.2, safety: 1.1 },
    precisionBonus: 0.03,
    grades: percentBands,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Procedure", "Observations Table", "Inferences", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "necta-acsee",
    board: "NECTA",
    region: "East Africa",
    country: "Tanzania",
    level: "A-Level",
    code: "132/3",
    title: "NECTA ACSEE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Advanced Certificate of Secondary Education (Form 6). Full A-Level practical: volumetric analysis (often redox), qualitative analysis, and organic identification.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.4, observe: 1.3, place: 1.1 },
    precisionBonus: 0.06,
    grades: percentBands,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Method", "Results Table", "Observations", "Calculations", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "uneb-uce",
    board: "UNEB",
    region: "East Africa",
    country: "Uganda",
    level: "O-Level",
    code: "545/3",
    title: "UNEB UCE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Uganda Certificate of Education. Practical paper covers volumetric analysis with a standard reagent set (NaOH, NH₃, HCl, HNO₃, AgNO₃, BaCl₂) and qualitative ion identification.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.3, observe: 1.3, safety: 1.05 },
    precisionBonus: 0.04,
    grades: [
      { grade: "D1", min: 80, descriptor: "Distinction 1" },
      { grade: "D2", min: 70, descriptor: "Distinction 2" },
      { grade: "C3", min: 65, descriptor: "Credit 3" },
      { grade: "C4", min: 60, descriptor: "Credit 4" },
      { grade: "C5", min: 55, descriptor: "Credit 5" },
      { grade: "C6", min: 50, descriptor: "Credit 6" },
      { grade: "P7", min: 45, descriptor: "Pass 7" },
      { grade: "P8", min: 40, descriptor: "Pass 8" },
      { grade: "F9", min: 0,  descriptor: "Fail" },
    ],
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus", "Procedure", "Results", "Observations", "Inferences", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "uneb-uace",
    board: "UNEB",
    region: "East Africa",
    country: "Uganda",
    level: "A-Level",
    code: "P525/3",
    title: "UNEB UACE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Uganda Advanced Certificate of Education. Advanced practical: redox titrations, qualitative analysis of unknowns, and identification of organic functional groups.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.4, observe: 1.3 },
    precisionBonus: 0.06,
    grades: [
      { grade: "A", min: 80, descriptor: "Excellent" },
      { grade: "B", min: 65, descriptor: "Very good" },
      { grade: "C", min: 55, descriptor: "Good" },
      { grade: "D", min: 45, descriptor: "Satisfactory" },
      { grade: "E", min: 35, descriptor: "Marginal" },
      { grade: "O", min: 25, descriptor: "Subsidiary pass" },
      { grade: "F", min: 0,  descriptor: "Fail" },
    ],
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Method", "Results Table", "Observations", "Calculations", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "reb-nesa-a",
    board: "REB/NESA",
    region: "East Africa",
    country: "Rwanda",
    level: "A-Level",
    code: "S6 Chem III",
    title: "REB/NESA S6 Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Rwanda's National Examination and School Inspection Authority. S6 Chemistry splits into Theory and Practical papers (1h 30m each). Full working expected on all calculations per NESA's Bloom-taxonomy assessment framework.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.35, observe: 1.25, place: 1.1 },
    precisionBonus: 0.05,
    grades: percentBands,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Procedure", "Results", "Observations", "Full Working", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "eaes-ethiopia",
    board: "EAES",
    region: "East Africa",
    country: "Ethiopia",
    level: "A-Level",
    code: "EHEECE Chem",
    title: "Ethiopia EHEECE Chemistry",
    year: "2024–2026",
    summary:
      "Educational Assessment and Examination Services (formerly NEAEA). Chemistry is examined via a single written paper — no standalone lab exam. Practical reasoning is tested only in writing. ChemVM's Ethiopia mode still trains the bench then reports in the written-scenario format the ministry expects.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.3, measure: 1.2, safety: 0.9 },
    precisionBonus: 0.02,
    grades: percentBands,
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },

  // ─── SOUTHERN AFRICA ────────────────────────────────────────────────────
  {
    id: "dbe-nsc",
    board: "DBE",
    region: "Southern Africa",
    country: "South Africa",
    level: "A-Level",
    code: "NSC Phys Sci P2",
    title: "DBE NSC Physical Sciences: Chemistry (Grade 12)",
    year: "2024–2026",
    summary:
      "National Senior Certificate (Matric). Chemistry sits inside Physical Sciences Paper 2. Practicals are school-based (SBA), with a national moderated component — technique, tabulation and calculation each carry mark weight.",
    practicalMode: "school-based",
    weights: { ...neutral, measure: 1.3, observe: 1.2, safety: 1.1 },
    precisionBonus: 0.04,
    grades: nscBands,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Hypothesis", "Apparatus", "Method", "Results", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "ecz-zambia",
    board: "ECZ",
    region: "Southern Africa",
    country: "Zambia",
    level: "O-Level",
    code: "5124",
    title: "ECZ Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Examinations Council of Zambia. School Certificate Chemistry mirrors the Cambridge O-Level structure — standalone practical or alternative-to-practical paper depending on centre resourcing.",
    practicalMode: "standalone",
    weights: { ...neutral, observe: 1.25, measure: 1.25, safety: 1.05 },
    precisionBonus: 0.03,
    grades: [
      { grade: "1", min: 80, descriptor: "Distinction" },
      { grade: "2", min: 70, descriptor: "Distinction" },
      { grade: "3", min: 60, descriptor: "Merit" },
      { grade: "4", min: 55, descriptor: "Merit" },
      { grade: "5", min: 50, descriptor: "Credit" },
      { grade: "6", min: 45, descriptor: "Credit" },
      { grade: "7", min: 40, descriptor: "Satisfactory" },
      { grade: "8", min: 35, descriptor: "Satisfactory" },
      { grade: "9", min: 0,  descriptor: "Unsatisfactory" },
    ],
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus", "Procedure", "Observations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "maneb-malawi",
    board: "MANEB",
    region: "Southern Africa",
    country: "Malawi",
    level: "O-Level",
    code: "MSCE Chem",
    title: "MANEB MSCE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Malawi National Examinations Board. MSCE Chemistry includes a practical paper covering titration and qualitative analysis with the standard reagent set.",
    practicalMode: "standalone",
    weights: { ...neutral, observe: 1.25, measure: 1.2, safety: 1.05 },
    precisionBonus: 0.03,
    grades: percentBands,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus", "Procedure", "Observations", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "esec-eswatini",
    board: "ESEC",
    region: "Southern Africa",
    country: "Eswatini",
    level: "O-Level",
    code: "EGCSE Chem",
    title: "ESEC EGCSE Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Eswatini Examinations Council. EGCSE Chemistry runs a Cambridge-derived practical paper with the same core skill set — titration, qualitative analysis, observation discipline.",
    practicalMode: "standalone",
    weights: { ...neutral, observe: 1.3, measure: 1.25, safety: 1.05 },
    precisionBonus: 0.03,
    grades: ukStyle,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Method", "Results", "Observations", "Conclusion", "Sources of Error"],
      signatureRequired: false,
      showRawMarks: false,
    },
  },
  {
    id: "inade-angola",
    board: "INADE",
    region: "Southern Africa",
    country: "Angola",
    level: "A-Level",
    code: "12ª Classe",
    title: "Angola Exame Nacional — Química (12ª Classe)",
    year: "2024–2026",
    summary:
      "Instituto Nacional de Avaliação e de Desenvolvimento da Educação. Chemistry is a written-only national exam — practical skills tested via scenario questions. ChemVM still trains the bench and generates a written-scenario report.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: [
      { grade: "MB", min: 80, descriptor: "Muito Bom" },
      { grade: "B",  min: 65, descriptor: "Bom" },
      { grade: "S",  min: 50, descriptor: "Suficiente" },
      { grade: "I",  min: 0,  descriptor: "Insuficiente" },
    ],
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },
  {
    id: "inece-mozambique",
    board: "INECE",
    region: "Southern Africa",
    country: "Mozambique",
    level: "A-Level",
    code: "12ª Classe",
    title: "Moçambique Exame Nacional — Química (12ª Classe)",
    year: "2024–2026",
    summary:
      "Instituto Nacional de Exames, Certificação e Equivalências. Structurally identical to Angola — written-only assessment, no standalone bench exam.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: [
      { grade: "MB", min: 80, descriptor: "Muito Bom" },
      { grade: "B",  min: 65, descriptor: "Bom" },
      { grade: "S",  min: 50, descriptor: "Suficiente" },
      { grade: "I",  min: 0,  descriptor: "Insuficiente" },
    ],
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },
  {
    id: "madagascar-bac",
    board: "Madagascar Bac",
    region: "Southern Africa",
    country: "Madagascar",
    level: "A-Level",
    code: "Bac Série D/C",
    title: "Baccalauréat malgache — Physique-Chimie",
    year: "2024–2026",
    summary:
      "Ministère de l'Éducation Nationale. Follows the Francophone written-scenario pattern — practical reasoning examined on paper, no dedicated bench exam.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: bacBands,
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },

  // ─── CENTRAL AFRICA ─────────────────────────────────────────────────────
  {
    id: "cameroon-gce-o",
    board: "Cameroon GCE",
    region: "Central Africa",
    country: "Cameroon (Anglophone)",
    level: "O-Level",
    code: "GCE O/L Chem P3",
    title: "Cameroon GCE O-Level Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "Cameroon GCE Board Anglophone subsystem. Paper 3 is a standalone practical — titration and qualitative analysis, with mark schemes crediting each calculation stage.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.35, observe: 1.3, safety: 1.05 },
    precisionBonus: 0.04,
    grades: ukStyle,
    topics: oLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus", "Procedure", "Results Table", "Observations", "Inferences", "Calculations", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "cameroon-gce-a",
    board: "Cameroon GCE",
    region: "Central Africa",
    country: "Cameroon (Anglophone)",
    level: "A-Level",
    code: "GCE A/L Chem P3",
    title: "Cameroon GCE A-Level Chemistry (Practical)",
    year: "2024–2026",
    summary:
      "GCE Board Advanced Level Chemistry Practical — multi-part titration to percentage-composition problems, marked stage-by-stage.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.45, observe: 1.3, place: 1.1 },
    precisionBonus: 0.06,
    grades: ukStyle,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Aim", "Apparatus & Reagents", "Method", "Results Table", "Observations", "Full Calculation Working", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "cameroon-bac",
    board: "Cameroon Bac",
    region: "Central Africa",
    country: "Cameroon (Francophone)",
    level: "A-Level",
    code: "Bac C/D — Épreuve de Chimie Pratique",
    title: "Baccalauréat Camerounais — Chimie (TP)",
    year: "2024–2026",
    summary:
      "Cameroon Francophone Baccalauréat. Unusually for a Francophone system, runs a dedicated Épreuve de Chimie Pratique — bench-based, marked in French with the same rigour as the GCE Board's practical.",
    practicalMode: "standalone",
    weights: { ...neutral, measure: 1.4, observe: 1.3 },
    precisionBonus: 0.05,
    grades: bacBands,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Objectif", "Matériel et Réactifs", "Mode Opératoire", "Résultats", "Observations", "Calculs", "Discussion", "Conclusion"],
      signatureRequired: true,
      showRawMarks: true,
    },
  },
  {
    id: "exetat-drc",
    board: "EXETAT",
    region: "Central Africa",
    country: "DR Congo",
    level: "A-Level",
    code: "Diplôme d'État",
    title: "DRC EXETAT — Chimie",
    year: "2024–2026",
    summary:
      "Examen d'État. Chemistry is examined via written paper — no standalone bench exam. ChemVM trains technique and reports in written-scenario format.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: bacBands,
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },
  {
    id: "congo-bac",
    board: "Congo Bac",
    region: "Central Africa",
    country: "Republic of Congo (Brazzaville)",
    level: "A-Level",
    code: "Bac Série D/C",
    title: "Baccalauréat congolais — Chimie",
    year: "2024–2026",
    summary:
      "Congo-Brazzaville Baccalauréat, Série D/C. Written-only assessment — no dedicated practical paper, unlike neighbouring Cameroon's Francophone stream.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: bacBands,
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },

  // ─── WEST AFRICA — FRANCOPHONE CLUSTER ──────────────────────────────────
  {
    id: "senegal-bac",
    board: "Senegal Bac",
    region: "West Africa",
    country: "Senegal · Côte d'Ivoire · Mali · Burkina Faso · Niger · Guinea · Togo · Benin · Gabon",
    level: "A-Level",
    code: "Bac Série S",
    title: "Baccalauréat — Physique-Chimie (Série S)",
    year: "2024–2026",
    summary:
      "Senegal's Office du Baccalauréat and the Francophone West-African cluster. Practical skills are tested in writing (scenarios, protocol design, expected observations) rather than at the bench.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.25, measure: 1.2 },
    precisionBonus: 0.02,
    grades: bacBands,
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },

  // ─── NORTH AFRICA ───────────────────────────────────────────────────────
  {
    id: "egypt-thanaweya",
    board: "Thanaweya Amma",
    region: "North Africa",
    country: "Egypt",
    level: "A-Level",
    code: "الثانوية العامة",
    title: "Egypt Thanaweya Amma — Chemistry",
    year: "2024–2026",
    summary:
      "General Secondary Education Certificate, Ministry of Education and Technical Education. Chemistry is examined entirely through a written paper — no standalone practical exam.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: [
      { grade: "ممتاز", min: 85, descriptor: "Excellent (mumtaz)" },
      { grade: "جيد جدًا", min: 75, descriptor: "Very good (jayyid jiddan)" },
      { grade: "جيد",    min: 65, descriptor: "Good (jayyid)" },
      { grade: "مقبول",  min: 50, descriptor: "Acceptable (maqbul)" },
      { grade: "ضعيف",   min: 0,  descriptor: "Weak (da'if)" },
    ],
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },
  {
    id: "maghreb-bac",
    board: "Maghreb Bac",
    region: "North Africa",
    country: "Morocco · Tunisia · Algeria",
    level: "A-Level",
    code: "Bac Physique-Chimie",
    title: "Baccalauréat — Physique-Chimie (Maghreb TP model)",
    year: "2024–2026",
    summary:
      "Maghreb Baccalauréat, Physique-Chimie stream. Travaux Pratiques (TP) are school-based; the national exam itself is written, testing protocol design and interpretation of results.",
    practicalMode: "school-based",
    weights: { ...neutral, observe: 1.25, measure: 1.2, place: 1.05 },
    precisionBonus: 0.03,
    grades: bacBands,
    topics: aLevelTopics,
    reportFormat: {
      sections: ["Objectif", "Protocole", "Matériel", "Résultats attendus", "Analyse", "Sources d'erreur", "Conclusion"],
      signatureRequired: false,
      showRawMarks: false,
    },
  },

  // ─── OTHERS FROM VOL II WITHOUT STANDALONE PRACTICAL ────────────────────
  {
    id: "sudan-ssc",
    board: "Sudan MoE",
    region: "North Africa",
    country: "Sudan",
    level: "A-Level",
    code: "Sudan School Cert.",
    title: "Sudan School Certificate — Chemistry",
    year: "2024–2026",
    summary:
      "Ministry of Education (Sudan). Chemistry is examined via written paper only — no standalone practical component. ChemVM still trains bench work and outputs a written-scenario report.",
    practicalMode: "written-scenario",
    weights: { ...neutral, observe: 1.2, measure: 1.15 },
    precisionBonus: 0.02,
    grades: [
      { grade: "ممتاز", min: 85, descriptor: "Excellent" },
      { grade: "جيد جدًا", min: 75, descriptor: "Very good" },
      { grade: "جيد",    min: 65, descriptor: "Good" },
      { grade: "مقبول",  min: 50, descriptor: "Acceptable" },
      { grade: "ضعيف",   min: 0,  descriptor: "Weak" },
    ],
    topics: aLevelTopics,
    reportFormat: writtenScenarioReport,
  },
];

export const gradeFor = (syllabus: Syllabus, percent: number): GradeBand =>
  syllabus.grades.find((g) => percent >= g.min) ?? syllabus.grades[syllabus.grades.length - 1];

export const REGIONS: Region[] = [
  "Southern Africa",
  "East Africa",
  "West Africa",
  "Central Africa",
  "North Africa",
  "International",
];

export const BOARDS: Board[] = Array.from(
  new Set(SYLLABI.map((s) => s.board)),
) as Board[];
