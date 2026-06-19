import asyncio
import httpx
import json
import os
from datetime import date
from typing import List, Dict

# --- FAST API IMPORTS ---
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from github import Github, Auth 
from google import genai 
from dotenv import load_dotenv

# Import schema
from models import ResumeSchema


# --- CONFIGURATION ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not GEMINI_API_KEY or not GITHUB_TOKEN:
    raise ValueError("Error: Keys not found! Check if .env file exists.")

GAP_THRESHOLD_DAYS = 60
REQUIRED_SKILLS_DB = {
    "Backend Developer": {"python", "fastapi", "postgresql", "docker", "git"},
    "SDE": {"c++", "dsa", "system design", "os", "dbms"},
    "Data Scientist": {"python", "pandas", "scikit-learn", "sql"}
}

# --- INITIALIZE FASTAPI ---
app = FastAPI(title="Resume Audit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI ADVICE GENERATOR ---

def generate_ai_advice(facts_object: dict) -> str:
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    ROLE: Senior Technical Recruiter.
    TASK: Create a brutally honest Action Plan based on this audit data.
    DATA: {json.dumps(facts_object, indent=2)}
    """

    print("\n[ System: diagnosing available models for your Key... ]")
    valid_model = None
    try:
        for m in client.models.list():
            if "gemini" in m.name.lower() and ("flash" in m.name.lower() or "pro" in m.name.lower()):
                valid_model = m.name.replace("models/", "") if m.name.startswith("models/") else m.name
                break
        if not valid_model: valid_model = "gemini-1.5-flash"
    except: valid_model = "gemini-1.5-flash"

    try:
        print(f"[ AI: Attempting generation with '{valid_model}'... ]")
        response = client.models.generate_content(model=valid_model, contents=prompt)
        return response.text
    except Exception as e:
        return f"FINAL ERROR: {e}"

# --- AUDIT LOGIC ---

def audit_github_mastery(resume: ResumeSchema) -> List[Dict]:
    auth = Auth.Token(GITHUB_TOKEN)
    g = Github(auth=auth)
    mastery_report = []
    for project in resume.projects:
        try:
            repo_path = str(project.github_url).split("github.com/")[-1].strip("/")
            repo = g.get_repo(repo_path)
            mastery_report.append({
                "project": project.title,
                "commits": repo.get_commits().totalCount,
                "languages": list(repo.get_languages().keys())
            })
        except Exception as e:
            mastery_report.append({"project": project.title, "error": str(e)})
    return mastery_report

async def verify_links(resume: ResumeSchema) -> List[Dict]:
    results = []
    urls = [str(link) for link in resume.portfolio_links]
    for project in resume.projects:
        urls.append(str(project.github_url))

    async with httpx.AsyncClient() as client:
        for url in urls:
            try:
                response = await client.head(url, timeout=5.0, follow_redirects=True)
                status = "ACTIVE" if response.status_code == 200 else f"BROKEN ({response.status_code})"
            except: status = "UNREACHABLE"
            results.append({"url": url, "status": status})
    return results

def check_skill_gaps(resume: ResumeSchema) -> Dict:
    target = resume.target_role
    required = REQUIRED_SKILLS_DB.get(target, set())
    candidate_skills = {s.lower() for s in resume.skills}
    missing = [skill for skill in required if skill not in candidate_skills]
    return {"target_role": target, "missing_skills": missing, "is_qualified": len(missing) == 0}

def analyze_timeline(resume: ResumeSchema) -> List[Dict]:
    gaps = []
    if not resume.experience or len(resume.experience) < 2: return gaps
    sorted_exp = sorted(resume.experience, key=lambda x: x.start_date)
    for i in range(1, len(sorted_exp)):
        prev_end = sorted_exp[i-1].end_date or date.today()
        gap_days = (sorted_exp[i].start_date - prev_end).days
        if gap_days > GAP_THRESHOLD_DAYS:
            gaps.append({"between": f"{sorted_exp[i-1].company} and {sorted_exp[i].company}", "gap_months": round(gap_days / 30.44, 1)})
    return gaps

def generate_facts_object(resume: ResumeSchema, links, skills, gaps, git) -> Dict:
    return {
        "candidate": resume.name,
        "verification_results": links,
        "skill_gap_analysis": skills,
        "employment_timeline_gaps": gaps,
        "github_project_mastery": git
    }

# --- API ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "Resume Audit System is Running"}

@app.post("/analyze")
async def analyze_resume(resume: ResumeSchema):
    """
    Receives JSON Resume -> Saves Files -> Returns Audit + Advice
    """
    print(f"--- Processing Resume for: {resume.name} ---")
    
    try:
        # 1. Run audits
        # OPTIMIZATION: 'verify_links' is native async, so we await it directly.
        links = await verify_links(resume)
        
        # CPU-bound tasks (fast enough to run sync)
        skills = check_skill_gaps(resume)
        gaps = analyze_timeline(resume)
        
        # OPTIMIZATION: 'audit_github_mastery' is blocking (Sync I/O). 
        # We offload it to a thread to keep the server responsive.
        git = await asyncio.to_thread(audit_github_mastery, resume)

        # 2. Aggregate
        facts_object = generate_facts_object(resume, links, skills, gaps, git)

        # Save facts.json locally
        try:
            with open("facts.json", "w") as f:
                json.dump(facts_object, indent=2, fp=f)
            print(" + SUCCESS: Saved facts.json locally")
        except Exception as e:
            print(f"Warning: Failed to save facts.json: {e}")

        # 3. AI Generation
        # OPTIMIZATION: 'generate_ai_advice' is blocking (Sync I/O).
        # We offload it to a thread. logic remains UNTOUCHED, but execution is now non-blocking.
        advice_report = await asyncio.to_thread(generate_ai_advice, facts_object)

        # Save report.md locally
        try:
            with open("report.md", "w") as f:
                f.write(advice_report)
            print(" + SUCCESS: Saved report.md locally")
        except Exception as e:
            print(f"Warning: Failed to save report.md: {e}")

        # 4. Return JSON
        return {
            "status": "success",
            "audit_data": facts_object,
            "ai_advice": advice_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("--- STARTING FASTAPI SERVER ---")
    uvicorn.run(app, host="127.0.0.1", port=8000)