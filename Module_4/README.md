# Smart Resume Audit & GitHub Analysis API

An AI-powered "Verification and Advisory" engine that audits developer resumes. It validates claims, calculates employment gaps, analyzes GitHub mastery, and generates a brutal, honest action plan using Google Gemini.

## 🛠️ How It Works

This system moves beyond simple keyword matching. It performs a three-layer audit on every resume submitted:

- **Verification Layer**: It physically pings every portfolio link to check for "404 Not Found" errors and uses the GitHub API to fetch real commit counts and language data from project repositories.
- **Logic Layer**: It calculates precise timelines to identify employment gaps longer than 60 days. It also compares the candidate's skills against a hard-coded database of required skills for roles like SDE or Data Scientist.
- **Intelligence Layer**: It aggregates all verified facts and "brutal truths" into a prompt for the **Google Gemini API**, which acts as a Senior Technical Recruiter to write a personalized improvement plan.

## 🧰 Tech Stack: Why & How

| **Component** | **Technology** | **Why We Chose It** | **How It Is Used** |

| **Backend** | **FastAPI** | High performance and easy to build. | Handles the API endpoints and async request management. |

| **Validation** | **Pydantic** | Ensures the JSON format is perfect. | Defines strict schemas for Resume, Project, and Experience models. |

| **Link Audit** | **Httpx** | Async capabilities for fast networking. | Pings multiple portfolio URLs concurrently to check for dead links (404s). |

| **Repo Audit** | **PyGithub** | Official, robust access to GitHub data. | Fetches commit counts and language breakdowns to verify project "Mastery". |

| **AI Engine** | **Google GenAI** | Cost-effective and large context window. | Generates the "Action Plan" and advice report based on the audit findings. |

## 🔄 Code Flow

- **Ingestion**: User sends a JSON payload to POST /analyze.
- **Validation**: Pydantic ensures dates are logical (e.g., End Date cannot be before Start Date).
- **Async Audits**:
  - **Links**: verify_links runs asynchronously to ping all URLs.
  - **GitHub**: audit_github_mastery is offloaded to a thread to prevent blocking the server while fetching repo stats.
- **Logic Processing**: analyze_timeline finds gaps > 60 days, and check_skill_gaps compares skills against the target role.
- **Aggregation**: All data is combined into a facts_object and saved locally as facts.json.
- **AI Generation**: The facts are sent to Gemini, which writes the report.md.
- **Response**: The API returns the structural audit data JSON + the AI advice text.

## 🚀 How to Run (Windows Instructions)

Follow these simple steps to set up the auditor on your individual Windows machine.

### 1\. Prerequisites

- **Python Installed**: You can download it from [python.org](https://www.python.org/downloads/).
- **API Keys**: You need a **Google Gemini API Key** (from Google AI Studio) and a **GitHub Personal Access Token** (Classic).

### 2\. Installation Steps (Command Prompt / PowerShell)

- **Clone the Code**  
    Download the project files or use git:  
    git clone &lt;your-repo-url&gt;  
    cd &lt;your-project-folder&gt;  
    <br/>
- **Create a Virtual Environment**  
    This keeps your project clean and isolated. Run:  
    python -m venv venv  
    <br/>
- **Activate the Environment**  
    venv\\Scripts\\activate  
    <br/><br/>_(You should see (venv) appear at the start of your command line)_
- **Install Dependencies**  
    pip install -r requirements.txt  
    <br/>
- **Set Up Keys**  
    Create a new file named .env in the root folder and paste your keys inside:  
    GEMINI_API_KEY=your_actual_google_key_here  
    GITHUB_TOKEN=your_actual_github_token_here  
    <br/>

### 3\. Start the Server

Run this command to start the application:

uvicorn main:app --reload  
<br/>

You should see a message saying: Uvicorn running on <http://127.0.0.1:8000>

## 📡 API Usage

### Endpoint

**POST** <http://127.0.0.1:8000/analyze>

### Input Example (JSON Body)

Copy and paste this into Postman, Insomnia, or your testing tool:

{  
"name": "Parth Manhas",  
"email": "<parth@example.com>",  
"target_role": "SDE",  
"portfolio_links": \["\[<https://google.com\>](<https://google.com>)", "\[<https://broken-link.com\>](<https://broken-link.com)"\>],  
"skills": \["python", "fastapi", "c++"\],  
"experience": \[  
{  
"company": "Tech Corp",  
"role": "Junior Dev",  
"start_date": "2023-01-01",  
"end_date": "2023-06-01"  
}  
\],  
"projects": \[  
{  
"title": "Resume Auditor",  
"github_url": "\[<https://github.com/PyGithub/PyGithub\>](<https://github.com/PyGithub/PyGithub>)",  
"technologies": \["python", "ai"\],  
"description": "An AI auditor."  
}  
\]  
}  
<br/>

### Output Example

The API will return a JSON object containing the audit results and the AI advice:

{  
"status": "success",  
"audit_data": {  
"candidate": "Parth Manhas",  
"verification_results": \[  
{"url": "\[<https://google.com\>](<https://google.com>)", "status": "ACTIVE"},  
{"url": "\[<https://broken-link.com\>](<https://broken-link.com>)", "status": "BROKEN (404)"}  
\],  
"skill_gap_analysis": {  
"target_role": "SDE",  
"missing_skills": \["dsa", "system design", "os"\],  
"is_qualified": false  
},  
"github_project_mastery": \[  
{  
"project": "Resume Auditor",  
"commits": 1542,  
"languages": \["Python", "HTML"\]  
}  
\]  
},  
"ai_advice": "## Action Plan\\n\\nParth, your GitHub activity is solid, but you are missing critical SDE fundamentals like DSA and System Design. Focus on..."  
}  
<br/>
