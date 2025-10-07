# backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    # Basic Information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    company = Column(String)
    job_title = Column(String)
    
    # Lead Details
    industry = Column(String)
    company_size = Column(String)
    location = Column(String)
    website = Column(String)
    linkedin_url = Column(String)
    
    # Scoring
    score = Column(Float, default=0.0)
    score_reasoning = Column(Text)
    
    # Pipeline
    pipeline_stage = Column(String, default="new")  # new, qualified, contacted, meeting, negotiation, closed_won, closed_lost
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text)

    # Soft Delete / Audit Trail
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
    deleted_by = Column(String, nullable=True)  # Can store user email or ID in future

    # Relationships
    messages = relationship("Message", back_populates="lead", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    message_type = Column(String)  # initial_outreach, follow_up, meeting_request, etc.
    subject = Column(String)
    content = Column(Text)
    sent = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lead = relationship("Lead", back_populates="messages")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    activity_type = Column(String)  # email_sent, call_made, meeting_scheduled, stage_change
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)
    
    lead = relationship("Lead", back_populates="activities")