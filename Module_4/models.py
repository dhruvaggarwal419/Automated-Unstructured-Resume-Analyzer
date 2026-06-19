from datetime import date
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, EmailStr, field_validator, ValidationInfo

class Project(BaseModel):
    title: str
    github_url: HttpUrl
    technologies: List[str]
    description: str

class Experience(BaseModel):
    company: str
    role: str
    start_date: date
    end_date: Optional[date] = None

    @field_validator('end_date')
    @classmethod
    def validate_date_order(cls, end_date_value: Optional[date], info: ValidationInfo) -> Optional[date]:
        """
        Ensures end_date is not earlier than start_date.
        """
        start_date_value = info.data.get('start_date')
        if end_date_value and start_date_value:
            if end_date_value < start_date_value:
                raise ValueError("End date cannot be earlier than start date")
        return end_date_value

class ResumeSchema(BaseModel):
    name: str
    email: EmailStr
    target_role: str
    portfolio_links: List[HttpUrl]
    skills: List[str]
    experience: List[Experience]
    projects: List[Project]