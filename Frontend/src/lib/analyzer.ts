export type KeywordMatch = {
  keyword: string;
  count: number;
};

export type AnalysisResult = {
  keywords: string[];
  matches: KeywordMatch[];
  missing: string[];
  coverageScore: number; // 0..100
  actionVerbCount: number;
  quantifiedBulletCount: number;
  sectionsPresent: string[];
  atsTips: string[];
  overallScore: number; // 0..100
};

const STOPWORDS = new Set([
  'the','and','or','for','with','in','on','to','of','a','an','as','by','at','is','are','be','from','that','this','your','our','their',
  'we','you','i','it','will','can','must','should','have','has','had','such','into','about','over','more','less','than'
]);

const ACTION_VERBS = [
  'led','managed','owned','built','created','designed','developed','implemented','delivered','launched','optimized','improved','reduced','increased','drove','achieved','coordinated','architected','migrated','automated','analyzed','debugged','refactored','deployed','configured','secured','mentored','collaborated','presented','negotiated','researched','tested'
];

const SECTION_HEADINGS = [
  'summary','experience','work experience','education','skills','projects','certifications','achievements','publications','languages'
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%+\.\-\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !STOPWORDS.has(w));
}


function topKeywords(jobText: string, limit = 30): string[] {
  const tokens = tokenize(jobText);
  const freq: Record<string, number> = {};
  for (const t of tokens) {
    if (t.length < 3) continue;
    freq[t] = (freq[t] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a,b) => b[1]-a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

function countOccurrences(text: string, word: string): number {
  const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

function detectSections(resumeText: string): string[] {
  const lower = resumeText.toLowerCase();
  return SECTION_HEADINGS.filter(h => lower.includes(h));
}

function countActionVerbs(resumeText: string): number {
  const lower = resumeText.toLowerCase();
  return ACTION_VERBS.reduce((acc, v) => acc + (lower.includes(v) ? 1 : 0), 0);
}

function countQuantifiedBullets(resumeText: string): number {
  const lines = resumeText.split(/\r?\n/);
  const bulletLike = lines.filter(l => /(^[-*•]\s)|(^\s*\d+\.)/.test(l) || l.trim().length > 0);
  return bulletLike.filter(l => /\d|%|million|billion/.test(l.toLowerCase())).length;
}

function atsTips(result: Omit<AnalysisResult, 'atsTips' | 'overallScore'>): string[] {
  const tips: string[] = [];
  if (result.missing.length > 0) tips.push('Add missing role-specific keywords to improve match.');
  if (result.actionVerbCount < 8) tips.push('Use strong action verbs at the start of bullets.');
  if (result.quantifiedBulletCount < 5) tips.push('Quantify impact with numbers, %, and time frames.');
  const requiredSections = ['summary','experience','education','skills'];
  const missingSections = requiredSections.filter(s => !result.sectionsPresent.includes(s));
  if (missingSections.length) tips.push(`Add standard sections: ${missingSections.join(', ')}.`);
  tips.push('Keep formatting ATS-friendly: single column, simple fonts, no images.');
  tips.push('Use consistent date formats (e.g., Jan 2022 – Dec 2023).');
  return tips;
}

function score(result: Omit<AnalysisResult, 'atsTips' | 'overallScore'>): number {
  const coverage = result.coverageScore; // 0..100
  const actionScore = Math.min(result.actionVerbCount * 3, 20); // cap 20
  const quantifyScore = Math.min(result.quantifiedBulletCount * 2, 20); // cap 20
  const sectionsScore = Math.min(result.sectionsPresent.length * 5, 20); // cap 20
  return Math.round(Math.min(100, coverage * 0.6 + actionScore + quantifyScore * 0.1 + sectionsScore * 0.1));
}

export function analyzeResume(resumeText: string, jobText: string): AnalysisResult {
  const keywords = topKeywords(jobText);
  const matches: KeywordMatch[] = keywords.map(k => ({ keyword: k, count: countOccurrences(resumeText, k) }));
  const missing = matches.filter(m => m.count === 0).map(m => m.keyword);
  const matchedCount = matches.filter(m => m.count > 0).length;
  const coverageScore = keywords.length ? Math.round((matchedCount / keywords.length) * 100) : 0;
  const actionVerbCount = countActionVerbs(resumeText);
  const quantifiedBulletCount = countQuantifiedBullets(resumeText);
  const sectionsPresent = detectSections(resumeText);
  const base = { keywords, matches, missing, coverageScore, actionVerbCount, quantifiedBulletCount, sectionsPresent };
  const tips = atsTips(base);
  const overallScore = score(base);
  return { ...base, atsTips: tips, overallScore };
}

export function extractTopMissingKeywords(result: AnalysisResult, limit = 10): string[] {
  return result.missing.slice(0, limit);
}
