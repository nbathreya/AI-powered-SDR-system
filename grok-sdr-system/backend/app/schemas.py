# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class LeadBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    pipeline_stage: Optional[str] = None
    notes: Optional[str] = None

class Lead(LeadBase):
    id: int
    score: float
    score_reasoning: Optional[str] = None
    pipeline_stage: str
    created_at: datetime
    updated_at: datetime
    
class Config:
    from_attributes = True

class ScoringCriteria(BaseModel):
    company_size_weight: float = 0.25
    job_title_weight: float = 0.25
    industry_relevance_weight: float = 0.25
    engagement_weight: float = 0.25
    target_industries: List[str] = ["Technology", "Finance", "Healthcare"]
    target_titles: List[str] = ["CEO", "CTO", "VP", "Director"]
    minimum_company_size: str = "50-200"

class StageUpdate(BaseModel):
    stage: str
    notes: Optional[str] = None

class MessageRequest(BaseModel):
    message_type: str = "initial_outreach"
    custom_context: Optional[str] = None