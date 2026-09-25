// DepEd EPP-TLE E-Class Record (ECR) Utility Functions

export function transmuteGrade(initialGrade: number): number {
  if (initialGrade >= 99.50) return 100;
  if (initialGrade >= 98.32) return 99;
  if (initialGrade >= 97.14) return 98;
  if (initialGrade >= 95.96) return 97;
  if (initialGrade >= 94.78) return 96;
  if (initialGrade >= 93.60) return 95;
  if (initialGrade >= 92.42) return 94;
  if (initialGrade >= 91.24) return 93;
  if (initialGrade >= 90.06) return 92;
  if (initialGrade >= 88.88) return 91;
  if (initialGrade >= 87.70) return 90;
  if (initialGrade >= 86.52) return 89;
  if (initialGrade >= 85.34) return 88;
  if (initialGrade >= 84.16) return 87;
  if (initialGrade >= 82.98) return 86;
  if (initialGrade >= 81.80) return 85;
  if (initialGrade >= 80.62) return 84;
  if (initialGrade >= 79.44) return 83;
  if (initialGrade >= 78.26) return 82;
  if (initialGrade >= 77.08) return 81;
  if (initialGrade >= 75.90) return 80;
  if (initialGrade >= 74.72) return 79;
  if (initialGrade >= 73.54) return 78;
  if (initialGrade >= 72.36) return 77;
  if (initialGrade >= 71.18) return 76;
  if (initialGrade >= 70.00) return 75; // Passing threshold
  if (initialGrade >= 65.34) return 74;
  if (initialGrade >= 60.67) return 73;
  if (initialGrade >= 56.01) return 72;
  if (initialGrade >= 51.34) return 71;
  if (initialGrade >= 46.67) return 70;
  if (initialGrade >= 42.01) return 69;
  if (initialGrade >= 37.34) return 68;
  if (initialGrade >= 32.68) return 67;
  if (initialGrade >= 28.01) return 66;
  if (initialGrade >= 23.35) return 65;
  if (initialGrade >= 18.68) return 64;
  if (initialGrade >= 14.01) return 63;
  if (initialGrade >= 9.35) return 62;
  if (initialGrade >= 4.68) return 61;
  return 60;
}

export function getDescriptor(transmutedGrade: number): string {
  if (transmutedGrade >= 90) return "Advancing";
  if (transmutedGrade >= 80) return "Benchmarking";
  if (transmutedGrade >= 75) return "Connecting";
  if (transmutedGrade >= 65) return "Developing";
  return "Emerging";
}

export interface ComponentScores {
  writtenWorks: number[];
  writtenWorksHPS: number[];
  performanceTasks: number[];
  performanceTasksHPS: number[];
  examScores: number[];
  examHPS: number[];
}

export function calculateTermGrade(scores: ComponentScores) {
  // 1. Written Works (20% for EPP-TLE)
  const wwTotal = scores.writtenWorks.reduce((a, b) => a + b, 0);
  const wwHPSTotal = scores.writtenWorksHPS.reduce((a, b) => a + b, 0);
  const wwPS = wwHPSTotal > 0 ? (wwTotal / wwHPSTotal) * 100 : 0;
  const wwWS = wwPS * 0.20;

  // 2. Performance Tasks (60% for EPP-TLE)
  const ptTotal = scores.performanceTasks.reduce((a, b) => a + b, 0);
  const ptHPSTotal = scores.performanceTasksHPS.reduce((a, b) => a + b, 0);
  const ptPS = ptHPSTotal > 0 ? (ptTotal / ptHPSTotal) * 100 : 0;
  const ptWS = ptPS * 0.60;

  // 3. Examinations (20% for EPP-TLE)
  const exTotal = scores.examScores.reduce((a, b) => a + b, 0);
  const exHPSTotal = scores.examHPS.reduce((a, b) => a + b, 0);
  const exPS = exHPSTotal > 0 ? (exTotal / exHPSTotal) * 100 : 0;
  const exWS = exPS * 0.20;

  const initialGrade = Number((wwWS + ptWS + exWS).toFixed(2));
  const transmutedGrade = transmuteGrade(initialGrade);
  const descriptor = getDescriptor(transmutedGrade);

  return {
    wwTotal,
    ptTotal,
    exTotal,
    wwPS: Number(wwPS.toFixed(2)),
    wwWS: Number(wwWS.toFixed(2)),
    ptPS: Number(ptPS.toFixed(2)),
    ptWS: Number(ptWS.toFixed(2)),
    exPS: Number(exPS.toFixed(2)),
    exWS: Number(exWS.toFixed(2)),
    initialGrade,
    transmutedGrade,
    descriptor,
    remark: transmutedGrade >= 75 ? "PASSED" : "FAILED",
  };
}

export interface ValuesEdScores {
  wwCognitive: number[]; wwCognitiveHPS: number[];
  wwAffective: number[]; wwAffectiveHPS: number[];
  ptCognitive: number[]; ptCognitiveHPS: number[];
  ptAffective: number[]; ptAffectiveHPS: number[];
  ptBehavioral: number[]; ptBehavioralHPS: number[];
  exST1: number; exST1HPS: number;
  exST2: number; exST2HPS: number;
  exTE: number; exTEHPS: number;
}

export function calculateValuesEdTermGrade(scores: ValuesEdScores) {
  // Written Works (20%)
  const wwCogTotal = scores.wwCognitive.reduce((a, b) => a + b, 0);
  const wwCogHPS = scores.wwCognitiveHPS.reduce((a, b) => a + b, 0);
  const wwCogPS = wwCogHPS > 0 ? (wwCogTotal / wwCogHPS) * 100 : 0;
  const wwCogWS = wwCogPS * 0.10;

  const wwAffTotal = scores.wwAffective.reduce((a, b) => a + b, 0);
  const wwAffHPS = scores.wwAffectiveHPS.reduce((a, b) => a + b, 0);
  const wwAffPS = wwAffHPS > 0 ? (wwAffTotal / wwAffHPS) * 100 : 0;
  const wwAffWS = wwAffPS * 0.10;
  
  const wwWS = wwCogWS + wwAffWS;

  // Performance Tasks (50%)
  const ptCogTotal = scores.ptCognitive.reduce((a, b) => a + b, 0);
  const ptCogHPS = scores.ptCognitiveHPS.reduce((a, b) => a + b, 0);
  const ptCogPS = ptCogHPS > 0 ? (ptCogTotal / ptCogHPS) * 100 : 0;
  const ptCogWS = ptCogPS * 0.10;

  const ptAffTotal = scores.ptAffective.reduce((a, b) => a + b, 0);
  const ptAffHPS = scores.ptAffectiveHPS.reduce((a, b) => a + b, 0);
  const ptAffPS = ptAffHPS > 0 ? (ptAffTotal / ptAffHPS) * 100 : 0;
  const ptAffWS = ptAffPS * 0.10;

  const ptBehTotal = scores.ptBehavioral.reduce((a, b) => a + b, 0);
  const ptBehHPS = scores.ptBehavioralHPS.reduce((a, b) => a + b, 0);
  const ptBehPS = ptBehHPS > 0 ? (ptBehTotal / ptBehHPS) * 100 : 0;
  const ptBehWS = ptBehPS * 0.30;

  const ptWS = ptCogWS + ptAffWS + ptBehWS;

  // Exams (30%)
  const exST1_WS = scores.exST1HPS > 0 ? (scores.exST1 / scores.exST1HPS) * 30 : 0;
  const exST2_WS = scores.exST2HPS > 0 ? (scores.exST2 / scores.exST2HPS) * 30 : 0;
  const exTE_WS = scores.exTEHPS > 0 ? (scores.exTE / scores.exTEHPS) * 40 : 0;
  
  const exPS = exST1_WS + exST2_WS + exTE_WS; // Max 100
  const exWS = exPS * 0.30;

  const initialGrade = Number((wwWS + ptWS + exWS).toFixed(2));
  const transmutedGrade = transmuteGrade(initialGrade);
  const descriptor = getDescriptor(transmutedGrade);

  return {
    wwCogTotal, wwCogPS, wwCogWS,
    wwAffTotal, wwAffPS, wwAffWS,
    wwWS,
    ptCogTotal, ptCogPS, ptCogWS,
    ptAffTotal, ptAffPS, ptAffWS,
    ptBehTotal, ptBehPS, ptBehWS,
    ptWS,
    exST1_WS, exST2_WS, exTE_WS,
    exPS, exWS,
    initialGrade,
    transmutedGrade,
    descriptor,
    remark: transmutedGrade >= 75 ? "PASSED" : "FAILED",
  };
}

export function calculateFinalGrade(term1: number, term2: number) {
  const average = (term1 + term2) / 2;
  const finalTransmuted = Math.round(average);
  return {
    finalGrade: finalTransmuted,
    descriptor: getDescriptor(finalTransmuted),
    remark: finalTransmuted >= 75 ? "PASSED" : "FAILED",
  };
}

export function calculateFinalGrade3Terms(term1: number, term2: number, term3: number) {
  const average = (term1 + term2 + term3) / 3;
  const finalTransmuted = Math.round(average);
  return {
    finalGrade: finalTransmuted,
    descriptor: getDescriptor(finalTransmuted),
    remark: finalTransmuted >= 75 ? "PASSED" : "FAILED",
  };
}

export function calculateItemAnalysis(scores: number[], maxScore: number) {
  if (scores.length === 0) return { totalStudents: 0, highestScore: 0, lowestScore: 0, mean: 0, mps: 0, sd: 0 };
  const N = scores.length;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / N;
  const mps = (mean / maxScore) * 100;
  const variance = scores.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / N;
  const sd = Math.sqrt(variance);
  return {
    totalStudents: N, highestScore: Math.max(...scores), lowestScore: Math.min(...scores),
    mean: Number(mean.toFixed(2)), mps: Number(mps.toFixed(2)), sd: Number(sd.toFixed(2)),
  };
}
