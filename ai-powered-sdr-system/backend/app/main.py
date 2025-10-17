# backend/app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

from . import models, schemas
from .database import engine, get_db
from .grok_client import GrokClient
from .lead_scorer import LeadScorer
from .message_generator import MessageGenerator

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Grok SDR System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Grok services
api_key = os.getenv("GROK_API_KEY")
if not api_key:
    raise ValueError("GROK_API_KEY environment variable is required")

grok_client = GrokClient(api_key=api_key)
lead_scorer = LeadScorer(grok_client)
message_generator = MessageGenerator(grok_client)

@app.get("/")
def read_root():
    return {"message": "Grok SDR System API", "status": "operational"}

@app.get("/health")
def health_check():
    """Health check endpoint to verify API and Grok connection"""
    try:
        grok_status = grok_client.test_connection()
    except:
        grok_status = False
    
    return {
        "status": "healthy",
        "grok_connected": grok_status,
        "database": "connected",
        "version": "1.0.0"
    }

# Lead CRUD Operations
@app.post("/api/leads", response_model=schemas.Lead)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    # Validate email format
    if not lead.email or "@" not in lead.email:
        raise HTTPException(
            status_code=422,
            detail="Please provide a valid email address."
        )

    # Check if email already exists
    existing_lead = db.query(models.Lead).filter(models.Lead.email == lead.email).first()
    if existing_lead:
        raise HTTPException(
            status_code=409,
            detail=f"A lead with email '{lead.email}' already exists. Try updating the existing lead instead."
        )

    # Validate required fields
    if not lead.first_name or not lead.first_name.strip():
        raise HTTPException(
            status_code=422,
            detail="First name is required."
        )

    if not lead.last_name or not lead.last_name.strip():
        raise HTTPException(
            status_code=422,
            detail="Last name is required."
        )

    try:
        db_lead = models.Lead(**lead.dict())
        db.add(db_lead)
        db.commit()
        db.refresh(db_lead)

        # Log lead creation activity
        activity = models.Activity(
            lead_id=db_lead.id,
            activity_type="lead_created",
            description=f"Lead {db_lead.first_name} {db_lead.last_name} was created",
            notes=f"Company: {db_lead.company}, Job Title: {db_lead.job_title}"
        )
        db.add(activity)

        # Score the lead immediately
        try:
            score_data = lead_scorer.score_lead(db_lead)
            db_lead.score = score_data["score"]
            db_lead.score_reasoning = score_data["reasoning"]

            # Auto-progress based on score
            if db_lead.score >= 80 and db_lead.pipeline_stage == "new":
                db_lead.pipeline_stage = "qualified"
                activity = models.Activity(
                    lead_id=db_lead.id,
                    activity_type="auto_stage_change",
                    description=f"Auto-qualified based on high score ({db_lead.score})",
                    notes="Automatically moved to Qualified stage due to score >= 80"
                )
                db.add(activity)

            db.commit()
        except Exception as score_error:
            # If scoring fails, log it but don't fail the lead creation
            print(f"Warning: Failed to score lead {db_lead.id}: {str(score_error)}")
            db_lead.score = 0.0
            db_lead.score_reasoning = "Scoring temporarily unavailable. Please try rescoring later."
            db.commit()

        return db_lead
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        error_message = str(e)

        # Handle specific database errors
        if "unique constraint" in error_message.lower() or "duplicate" in error_message.lower():
            raise HTTPException(
                status_code=409,
                detail="A lead with this information already exists."
            )
        elif "not null constraint" in error_message.lower():
            raise HTTPException(
                status_code=422,
                detail="Missing required information. Please fill in all required fields."
            )
        elif "foreign key" in error_message.lower():
            raise HTTPException(
                status_code=422,
                detail="Invalid reference data. Please check your input."
            )
        else:
            # Generic error
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while creating the lead. Please try again."
            )

@app.get("/api/leads", response_model=List[schemas.Lead])
def get_leads(skip: int = 0, limit: int = 100, include_deleted: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Lead)
    if not include_deleted:
        query = query.filter(models.Lead.is_deleted == False)
    leads = query.offset(skip).limit(limit).all()
    return leads

@app.get("/api/leads/{lead_id}", response_model=schemas.Lead)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(
        models.Lead.id == lead_id,
        models.Lead.is_deleted == False
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.put("/api/leads/{lead_id}", response_model=schemas.Lead)
def update_lead(lead_id: int, lead_update: schemas.LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Validate email if being updated
    if lead_update.email and lead_update.email != lead.email:
        if "@" not in lead_update.email:
            raise HTTPException(
                status_code=422,
                detail="Please provide a valid email address."
            )
        # Check if email already exists for another lead
        existing_lead = db.query(models.Lead).filter(
            models.Lead.email == lead_update.email,
            models.Lead.id != lead_id
        ).first()
        if existing_lead:
            raise HTTPException(
                status_code=409,
                detail=f"A lead with email '{lead_update.email}' already exists."
            )

    # Validate first_name if being updated
    if lead_update.first_name is not None:
        if not lead_update.first_name.strip():
            raise HTTPException(
                status_code=422,
                detail="First name cannot be empty."
            )

    # Validate last_name if being updated
    if lead_update.last_name is not None:
        if not lead_update.last_name.strip():
            raise HTTPException(
                status_code=422,
                detail="Last name cannot be empty."
            )

    try:
        for key, value in lead_update.dict(exclude_unset=True).items():
            setattr(lead, key, value)

        db.commit()
        db.refresh(lead)
        return lead
    except Exception as e:
        db.rollback()
        error_message = str(e)

        if "unique constraint" in error_message.lower() or "duplicate" in error_message.lower():
            raise HTTPException(
                status_code=409,
                detail="A lead with this information already exists."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while updating the lead."
            )

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(
        models.Lead.id == lead_id,
        models.Lead.is_deleted == False
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Soft delete
    lead.is_deleted = True
    lead.deleted_at = datetime.utcnow()
    lead.deleted_by = "system"  # TODO: Replace with actual user when auth is implemented

    # Log activity for audit trail
    activity = models.Activity(
        lead_id=lead.id,
        activity_type="lead_deleted",
        description=f"Lead {lead.first_name} {lead.last_name} was deleted",
        notes=f"Email: {lead.email}"
    )
    db.add(activity)

    db.commit()
    return {"message": "Lead deleted successfully", "lead_id": lead_id}

@app.post("/api/leads/{lead_id}/restore")
def restore_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(
        models.Lead.id == lead_id,
        models.Lead.is_deleted == True
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Deleted lead not found")

    # Restore lead
    lead.is_deleted = False
    lead.deleted_at = None
    lead.deleted_by = None

    # Log activity for audit trail
    activity = models.Activity(
        lead_id=lead.id,
        activity_type="lead_restored",
        description=f"Lead {lead.first_name} {lead.last_name} was restored",
        notes=f"Email: {lead.email}"
    )
    db.add(activity)

    db.commit()
    return {"message": "Lead restored successfully", "lead_id": lead_id}

# Lead Scoring
@app.post("/api/leads/{lead_id}/score")
def score_lead(lead_id: int, criteria: Optional[schemas.ScoringCriteria] = None, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    score_data = lead_scorer.score_lead(lead, custom_criteria=criteria)

    old_score = lead.score
    lead.score = score_data["score"]
    lead.score_reasoning = score_data["reasoning"]

    # Log scoring activity
    activity = models.Activity(
        lead_id=lead.id,
        activity_type="lead_scored",
        description=f"Lead scored: {lead.score}/100" + (f" (was {old_score})" if old_score else ""),
        notes=score_data["reasoning"][:200] if score_data["reasoning"] else None
    )
    db.add(activity)

    # Auto-progress based on score
    if lead.score >= 80 and lead.pipeline_stage == "new":
        lead.pipeline_stage = "qualified"
        activity = models.Activity(
            lead_id=lead.id,
            activity_type="auto_stage_change",
            description=f"Auto-qualified based on high score ({lead.score})",
            notes="Automatically moved to Qualified stage due to score >= 80"
        )
        db.add(activity)

    db.commit()

    return score_data

@app.post("/api/leads/score-batch")
def score_all_leads(criteria: Optional[schemas.ScoringCriteria] = None, db: Session = Depends(get_db)):
    leads = db.query(models.Lead).all()
    results = []
    
    for lead in leads:
        score_data = lead_scorer.score_lead(lead, custom_criteria=criteria)
        lead.score = score_data["score"]
        lead.score_reasoning = score_data["reasoning"]
        results.append({"lead_id": lead.id, "score": score_data["score"]})
    
    db.commit()
    return {"scored": len(results), "results": results}

# Message Generation
@app.post("/api/leads/{lead_id}/generate-message")
def generate_message(
    lead_id: int, 
    message_type: str = "initial_outreach",
    db: Session = Depends(get_db)
):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    message = message_generator.generate_message(lead, message_type)

    # Save message to database
    db_message = models.Message(
        lead_id=lead.id,
        message_type=message_type,
        content=message["content"],
        subject=message.get("subject")
    )
    db.add(db_message)

    # Log message generation activity
    activity = models.Activity(
        lead_id=lead.id,
        activity_type="message_generated",
        description=f"{message_type.replace('_', ' ').title()} message generated",
        notes=f"Subject: {message.get('subject', 'N/A')}"
    )
    db.add(activity)

    # Auto-progress to "contacted" if message is initial outreach and lead is qualified or new
    if message_type == "initial_outreach" and lead.pipeline_stage in ["new", "qualified"]:
        lead.pipeline_stage = "contacted"
        activity = models.Activity(
            lead_id=lead.id,
            activity_type="auto_stage_change",
            description=f"Auto-moved to Contacted after {message_type} message generated",
            notes="Automatically moved to Contacted stage after initial outreach message was created"
        )
        db.add(activity)

    db.commit()

    return message

@app.get("/api/leads/{lead_id}/messages")
def get_lead_messages(lead_id: int, db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter(models.Message.lead_id == lead_id).all()
    return messages

@app.post("/api/leads/{lead_id}/tune-message")
def tune_message(
    lead_id: int,
    tune_request: dict,
    db: Session = Depends(get_db)
):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    original_message = tune_request.get("original_message")
    instructions = tune_request.get("instructions")
    message_type = tune_request.get("message_type", "initial_outreach")

    # Use Grok to tune up the message based on instructions
    tuned_content = message_generator.tune_message(
        lead=lead,
        original_message=original_message,
        instructions=instructions,
        message_type=message_type
    )

    # Save the tuned message to database
    db_message = models.Message(
        lead_id=lead.id,
        message_type=f"{message_type}_tuned",
        content=tuned_content["content"],
        subject=tuned_content.get("subject")
    )
    db.add(db_message)

    # Log tune-up activity
    activity = models.Activity(
        lead_id=lead.id,
        activity_type="message_tuned",
        description=f"Message tuned based on feedback",
        notes=f"Instructions: {instructions[:200]}"
    )
    db.add(activity)

    db.commit()

    return tuned_content

# Pipeline Management
@app.put("/api/leads/{lead_id}/stage")
def update_lead_stage(
    lead_id: int, 
    stage_update: schemas.StageUpdate,
    db: Session = Depends(get_db)
):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.pipeline_stage = stage_update.stage
    
    # Log activity
    activity = models.Activity(
        lead_id=lead.id,
        activity_type="stage_change",
        description=f"Stage changed to {stage_update.stage}",
        notes=stage_update.notes
    )
    db.add(activity)
    db.commit()
    
    return {"message": "Stage updated", "new_stage": lead.pipeline_stage}

@app.get("/api/leads/{lead_id}/activities")
def get_lead_activities(lead_id: int, db: Session = Depends(get_db)):
    activities = db.query(models.Activity).filter(
        models.Activity.lead_id == lead_id
    ).order_by(models.Activity.timestamp.desc()).all()
    return activities

# Analytics
@app.get("/api/analytics/pipeline")
def get_pipeline_analytics(db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    pipeline_stats = db.query(
        models.Lead.pipeline_stage,
        func.count(models.Lead.id).label("count"),
        func.avg(models.Lead.score).label("avg_score")
    ).group_by(models.Lead.pipeline_stage).all()
    
    return [
        {
            "stage": stat[0],
            "count": stat[1],
            "avg_score": float(stat[2]) if stat[2] else 0
        }
        for stat in pipeline_stats
    ]