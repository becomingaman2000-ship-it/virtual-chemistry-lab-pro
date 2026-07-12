// Complete African & International Syllabuses Experiments Catalog (115 Experiments)

export interface SyllabusExperiment {
  id: number; // 1 to 115
  title: string;
  section: string; // Section 1 to 10
  objective: string;
  materials: string[];
  requiredChemicalIds: string[];
  steps: string[];
  expectedResult: string;
  theoreticalEquation: string;
  dwsimProof: {
    reactionType: string;
    deltaH?: string;
    gibbsEnergy?: string;
    equilibriumConstant?: string;
    nernstPotential?: string;
    kineticsRate?: string;
    notes: string;
  };
}

import { EXPERIMENTS_1_20 } from "./experimentsCatalog_1_20";
import { EXPERIMENTS_21_35 } from "./experimentsCatalog_21_35";
import { EXPERIMENTS_36_50 } from "./experimentsCatalog_36_50";
import { EXPERIMENTS_51_78 } from "./experimentsCatalog_51_78";
import { EXPERIMENTS_79_115 } from "./experimentsCatalog_79_115";

export const COMPLETE_SYLLABUS_EXPERIMENTS: SyllabusExperiment[] = [
  ...EXPERIMENTS_1_20,
  ...EXPERIMENTS_21_35,
  ...EXPERIMENTS_36_50,
  ...EXPERIMENTS_51_78,
  ...EXPERIMENTS_79_115,
];

export function getSyllabusExperiment(id: number): SyllabusExperiment {
  return COMPLETE_SYLLABUS_EXPERIMENTS.find(e => e.id === id) || COMPLETE_SYLLABUS_EXPERIMENTS[0];
}
