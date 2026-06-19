from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable, Optional

from ..models.resume import ResumeProfile
from ..models.screening import (
    CandidateScreeningResult,
    JobRequirements,
    Recommendation,
    ScreeningBreakdown,
    ScreeningResponse,
)
from .career_intelligence import CareerIntelligence, CareerIntelligenceAnalyzer
from .confidence_engine import ConfidenceReport
from .pipeline import ExtractionResult, ResumeEnrichment
from .skills_normalizer import _SKILL_DB, canonicalize_skills

_TITLE_PATTERNS = [
    "software engineer",
    "backend engineer",
    "frontend engineer",
    "full stack engineer",
    "full-stack engineer",
    "data analyst",
    "data scientist",
    "data engineer",
    "machine learning engineer",
    "ml engineer",
    "devops engineer",
    "product manager",
    "business analyst",
    "python developer",
    "java developer",
]

_EDUCATION_KEYWORDS = [
    "b.tech",
    "b.e.",
    "bachelor",
    "master",
    "m.tech",
    "mba",
    "phd",
    "b.sc",
    "m.sc",
]

_KEYWORD_STOPWORDS = {
    "and", "the", "with", "for", "you", "your", "will", "have", "this", "that",
    "from", "into", "using", "their", "they", "them", "must", "should", "years",
    "year", "role", "work", "team", "teams", "our", "job", "candidate", "required",
    "preferred", "plus", "good", "strong", "ability", "experience", "knowledge",
    "skills", "skill", "looking", "seeking",
}


@dataclass(frozen=True)
class CandidateContext:
    file_name: str
    profile: ResumeProfile
    enrichment: ResumeEnrichment
    confidence: ConfidenceReport
    career: CareerIntelligence


def _dedupe(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        normalized = item.strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(normalized)
    return result


def _extract_years_requirement(text: str) -> Optional[float]:
    patterns = [
        r"(\d+)(?:\+)?\s*\+?\s*years?\s+of\s+experience",
        r"minimum\s+of\s+(\d+)\s+years?",
        r"at\s+least\s+(\d+)\s+years?",
        r"(\d+)\s*-\s*(\d+)\s+years?",
    ]
    lowered = text.lower()
    for pattern in patterns:
        match = re.search(pattern, lowered)
        if not match:
            continue
        if len(match.groups()) == 2:
            return float(match.group(1))
        return float(match.group(1))
    return None


def _extract_title_hints(text: str) -> list[str]:
    lowered = text.lower()
    titles = [title.title() for title in _TITLE_PATTERNS if title in lowered]
    first_line = next((line.strip() for line in text.splitlines() if line.strip()), "")
    if first_line and len(first_line.split()) <= 8 and not any(ch in first_line for ch in ".:"):
        titles.insert(0, first_line.title())
    return _dedupe(titles[:5])


def _extract_education_preferences(text: str) -> list[str]:
    lowered = text.lower()
    return [keyword.upper() if keyword == "mba" else keyword.title() for keyword in _EDUCATION_KEYWORDS if keyword in lowered]


def _extract_keywords(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z\-/+.#]{2,}", text.lower())
    keywords = [token for token in tokens if token not in _KEYWORD_STOPWORDS]
    return _dedupe(keywords)[:20]


def _skill_variants() -> list[tuple[str, str]]:
    variants: list[tuple[str, str]] = []
    for entry in _SKILL_DB:
        variants.append((entry.canonical.lower(), entry.canonical))
        for alias in entry.aliases:
            variants.append((alias.lower(), entry.canonical))
    variants.sort(key=lambda item: len(item[0]), reverse=True)
    return variants


_SKILL_VARIANTS = _skill_variants()


def _extract_skills_from_section(text: str) -> list[str]:
    lowered = f" {text.lower()} "
    found: list[str] = []
    for variant, canonical in _SKILL_VARIANTS:
        pattern = rf"(?<![a-z0-9]){re.escape(variant)}(?![a-z0-9])"
        if re.search(pattern, lowered):
            found.append(canonical)
    return canonicalize_skills(found)


def _split_jd_sections(job_description: str) -> tuple[list[str], list[str]]:
    required_lines: list[str] = []
    preferred_lines: list[str] = []
    fallback_lines: list[str] = []
    for raw_line in job_description.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        lowered = line.lower()
        if any(marker in lowered for marker in ["preferred", "good to have", "nice to have", "plus:"]):
            preferred_lines.append(line)
        elif any(marker in lowered for marker in ["required", "must have", "responsibilities", "need", "qualification"]):
            required_lines.append(line)
        else:
            fallback_lines.append(line)
    if not required_lines and fallback_lines:
        required_lines = fallback_lines[: min(8, len(fallback_lines))]
    if not preferred_lines and len(fallback_lines) > len(required_lines):
        preferred_lines = fallback_lines[len(required_lines):]
    return required_lines, preferred_lines


class ResumeScreeningService:

    def __init__(self):
        self._career_analyzer = CareerIntelligenceAnalyzer()

    def parse_job_description(self, job_description: str) -> JobRequirements:
        required_lines, preferred_lines = _split_jd_sections(job_description)
        required_skills = _extract_skills_from_section("\n".join(required_lines))
        preferred_skills = _extract_skills_from_section("\n".join(preferred_lines))

        if not required_skills:
            all_skills = _extract_skills_from_section(job_description)
            required_skills = all_skills[:6]
            preferred_skills = [skill for skill in all_skills[6:10] if skill not in required_skills]

        return JobRequirements(
            title_hints=_extract_title_hints(job_description),
            required_skills=required_skills,
            preferred_skills=[skill for skill in preferred_skills if skill not in required_skills][:6],
            education_preferences=_extract_education_preferences(job_description),
            min_years_experience=_extract_years_requirement(job_description),
            keywords=_extract_keywords(job_description),
        )

    def build_candidate_context(self, file_name: str, extraction: ExtractionResult) -> CandidateContext:
        career = extraction.enrichment.career_intelligence or self._career_analyzer.analyze(extraction.profile)
        return CandidateContext(
            file_name=file_name,
            profile=extraction.profile,
            enrichment=extraction.enrichment,
            confidence=extraction.confidence,
            career=career,
        )

    def screen_resume(self, requirements: JobRequirements, candidate: CandidateContext) -> CandidateScreeningResult:
        resume_skills = canonicalize_skills(candidate.profile.skills)
        resume_skill_set = {skill.lower(): skill for skill in resume_skills}
        matched_required = [skill for skill in requirements.required_skills if skill.lower() in resume_skill_set]
        missing_required = [skill for skill in requirements.required_skills if skill.lower() not in resume_skill_set]
        matched_preferred = [skill for skill in requirements.preferred_skills if skill.lower() in resume_skill_set]

        required_ratio = len(matched_required) / max(len(requirements.required_skills), 1)
        preferred_ratio = len(matched_preferred) / max(len(requirements.preferred_skills), 1) if requirements.preferred_skills else 1.0
        skill_score = round((required_ratio * 30) + (preferred_ratio * 15))

        years = candidate.career.total_years_experience
        if requirements.min_years_experience:
            years_ratio = min(years / requirements.min_years_experience, 1.0)
            experience_score = round(years_ratio * 25)
        else:
            experience_score = 20 if years > 0 else 8

        title_text = " ".join(filter(None, [
            candidate.profile.personal_info.headline,
            candidate.career.title_from_experience,
            " ".join(filter(None, [exp.title for exp in candidate.profile.experience[:2]])),
        ])).lower()
        title_hits = [title for title in requirements.title_hints if title.lower() in title_text]
        domain_hits = sum(1 for keyword in requirements.keywords[:10] if keyword.lower() in self._candidate_text(candidate))
        domain_score = min(15, round(len(title_hits) * 7 + min(domain_hits, 8)))

        education_text = " ".join(
            filter(None, [
                " ".join(filter(None, [entry.degree, entry.field_of_study, entry.institution]))
                for entry in candidate.profile.education
            ])
        ).lower()
        education_hits = [pref for pref in requirements.education_preferences if pref.lower() in education_text]
        project_keyword_hits = sum(1 for keyword in requirements.keywords[:8] if keyword.lower() in self._candidate_text(candidate))
        education_score = min(10, len(education_hits) * 4 + min(project_keyword_hits, 6))

        quality_report = candidate.enrichment.quality_report
        quality_component = (quality_report.overall_score / 100) if quality_report else 0.7
        quality_score = min(5, round((quality_component * 3) + (candidate.confidence.overall * 2)))

        total_score = max(0, min(100, skill_score + experience_score + domain_score + education_score + quality_score))
        recommendation = self._recommend(total_score, missing_required, requirements)
        strengths = self._build_strengths(candidate, matched_required, matched_preferred, requirements, title_hits)
        gaps = self._build_gaps(candidate, missing_required, requirements, years, title_hits)

        candidate_name = candidate.profile.personal_info.name or candidate.file_name.rsplit(".", 1)[0]
        notes = None
        if quality_report and quality_report.overall_score < 65:
            notes = "Resume quality is weak enough that better formatting or clearer bullets could change the outcome."

        return CandidateScreeningResult(
            candidate_name=candidate_name,
            file_name=candidate.file_name,
            score=total_score,
            strengths=strengths[:3],
            gaps=gaps[:3],
            recommendation=recommendation,
            matched_skills=matched_required + [skill for skill in matched_preferred if skill not in matched_required],
            missing_skills=missing_required[:6],
            years_experience=round(years, 1),
            current_title=candidate.career.title_from_experience,
            current_employer=candidate.career.current_employer,
            confidence=round(candidate.confidence.overall, 3),
            breakdown=ScreeningBreakdown(
                skill_score=skill_score,
                experience_score=experience_score,
                domain_score=domain_score,
                education_score=education_score,
                quality_score=quality_score,
            ),
            notes=notes,
        )

    def screen_extractions(self, job_description: str, extractions: list[tuple[str, ExtractionResult]]) -> ScreeningResponse:
        requirements = self.parse_job_description(job_description)
        candidates: list[CandidateScreeningResult] = []
        for file_name, extraction in extractions:
            if not extraction.success:
                candidates.append(
                    CandidateScreeningResult(
                        candidate_name=file_name.rsplit(".", 1)[0],
                        file_name=file_name,
                        score=0,
                        strengths=[],
                        gaps=[extraction.error or "Resume could not be processed."],
                        recommendation=Recommendation.NOT_FIT,
                        confidence=0.0,
                        notes="Extraction failed.",
                    )
                )
                continue
            context = self.build_candidate_context(file_name, extraction)
            candidates.append(self.screen_resume(requirements, context))

        candidates.sort(key=lambda candidate: (-candidate.score, candidate.candidate_name.lower()))
        for index, candidate in enumerate(candidates, start=1):
            candidate.rank = index

        return ScreeningResponse(
            job_description=job_description,
            requirements=requirements,
            candidates=candidates,
        )

    def _recommend(self, score: int, missing_required: list[str], requirements: JobRequirements) -> Recommendation:
        if score >= 75 and len(missing_required) <= max(1, len(requirements.required_skills) // 3):
            return Recommendation.STRONG_FIT
        if score >= 55:
            return Recommendation.MODERATE_FIT
        return Recommendation.NOT_FIT

    def _build_strengths(
        self,
        candidate: CandidateContext,
        matched_required: list[str],
        matched_preferred: list[str],
        requirements: JobRequirements,
        title_hits: list[str],
    ) -> list[str]:
        strengths: list[str] = []
        if matched_required:
            strengths.append(f"Matches {len(matched_required)}/{max(len(requirements.required_skills), 1)} key JD skills: {', '.join(matched_required[:4])}.")
        if candidate.career.total_years_experience > 0:
            strengths.append(f"Shows {candidate.career.total_years_experience:.1f} years of relevant experience in {candidate.career.primary_domain.value}.")
        if title_hits:
            strengths.append(f"Recent role alignment is strong for {', '.join(title_hits[:2])}.")
        elif candidate.career.notable_companies:
            strengths.append(f"Experience includes notable employers such as {', '.join(candidate.career.notable_companies[:2])}.")
        if matched_preferred and len(strengths) < 3:
            strengths.append(f"Also covers preferred skills like {', '.join(matched_preferred[:3])}.")
        if candidate.enrichment.quality_report and len(strengths) < 3:
            overall = candidate.enrichment.quality_report.overall_score
            strengths.append(f"Resume quality is solid with an ATS/readability score of {overall:.0f}/100.")
        return _dedupe(strengths)

    def _build_gaps(
        self,
        candidate: CandidateContext,
        missing_required: list[str],
        requirements: JobRequirements,
        years: float,
        title_hits: list[str],
    ) -> list[str]:
        gaps: list[str] = []
        if missing_required:
            gaps.append(f"Missing core JD skills: {', '.join(missing_required[:4])}.")
        if requirements.min_years_experience and years < requirements.min_years_experience:
            gaps.append(f"Experience is below the JD target: {years:.1f} years vs {requirements.min_years_experience:.1f}+ required.")
        if requirements.title_hints and not title_hits:
            gaps.append(f"Resume does not show a clear title match for {', '.join(requirements.title_hints[:2])}.")
        quality_report = candidate.enrichment.quality_report
        if quality_report and quality_report.overall_score < 65:
            gaps.append("Resume presentation is weak enough that achievements may be under-represented.")
        if not gaps:
            gaps.append("No major risk found from resume evidence; interview should validate depth and communication.")
        return _dedupe(gaps)

    def _candidate_text(self, candidate: CandidateContext) -> str:
        return " ".join(
            [
                " ".join(candidate.profile.skills),
                candidate.profile.summary or "",
                " ".join(filter(None, [candidate.profile.personal_info.headline])),
                " ".join(
                    " ".join(filter(None, [exp.title, exp.company, " ".join(exp.bullets)]))
                    for exp in candidate.profile.experience
                ),
                " ".join(
                    " ".join(filter(None, [proj.name, proj.description, " ".join(proj.technologies)]))
                    for proj in candidate.profile.projects
                ),
            ]
        ).lower()
