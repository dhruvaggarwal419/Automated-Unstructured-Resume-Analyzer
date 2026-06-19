import type { AnalysisResult } from './analyzer';
import { extractTopMissingKeywords } from './analyzer';

const ACTION_VERBS = [
  'Led', 'Managed', 'Built', 'Created', 'Designed', 'Developed', 'Implemented', 'Delivered', 'Launched', 'Optimized', 'Improved', 'Reduced', 'Increased', 'Achieved', 'Coordinated', 'Architected', 'Automated', 'Analyzed', 'Refactored', 'Deployed', 'Secured'
];

function sampleActionVerb(): string { return ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)]; }

export type OptimizationOutput = {
  summarySuggestion?: string;
  bulletSuggestions: string[];
  skillsToAdd: string[];
};

export function suggestOptimizations(resumeText: string, jobText: string, analysis: AnalysisResult): OptimizationOutput {
  const missing = extractTopMissingKeywords(analysis, 10);
  const skillsToAdd = missing;
  const density = jobText.length / Math.max(1, resumeText.length);
  const bullets = missing.map((kw) => {
    const verb = sampleActionVerb();
    return `${verb} ${kw} initiatives, achieving measurable impact (e.g., +25% efficiency, -15% cost) by applying best practices and cross-functional collaboration.`;
  });

  const hasSummary = analysis.sectionsPresent.includes('summary');
  const summarySuggestion = hasSummary ? undefined :
    'Results-driven professional with proven experience aligning skills to role requirements; highlights include delivering measurable impact, optimizing processes, and collaborating across teams to exceed KPIs.';

  return {
    summarySuggestion,
    bulletSuggestions: bullets.slice(0, Math.min(6, Math.max(3, Math.round(density * 4)))),
    skillsToAdd,
  };
}
