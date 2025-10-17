# backend/app/lead_scorer.py
from typing import Dict, Any, Optional
import json

class LeadScorer:
    def __init__(self, grok_client):
        self.grok_client = grok_client
    
    def score_lead(self, lead: Any, custom_criteria: Optional[Any] = None) -> Dict[str, Any]:
        """Score a lead using Grok AI"""
        
        # Prepare lead data
        lead_data = {
            "name": f"{lead.first_name} {lead.last_name}",
            "email": lead.email,
            "company": lead.company,
            "job_title": lead.job_title,
            "industry": lead.industry,
            "company_size": lead.company_size,
            "location": lead.location
        }
        
        # Default criteria
        criteria = {
            "target_industries": ["Technology", "Finance", "Healthcare", "SaaS", "Enterprise Software"],
            "target_titles": ["CEO", "CTO", "VP", "Director", "Head of", "Manager"],
            "ideal_company_size": "50-500 employees",
            "location_preference": "North America"
        }
        
        # Override with custom criteria if provided
        if custom_criteria:
            criteria.update(custom_criteria.dict() if hasattr(custom_criteria, 'dict') else custom_criteria)
        
        system_prompt = """You are an expert sales lead qualification AI. Score leads from 0-100 based on:
        1. Job title relevance and decision-making power
        2. Company size and growth potential
        3. Industry fit
        4. Geographic location
        5. Overall fit with ideal customer profile
        
        Return a JSON object with:
        - score: number between 0-100
        - reasoning: brief explanation (2-3 sentences)
        - strengths: array of positive factors
        - weaknesses: array of limiting factors
        - recommended_action: "high_priority", "medium_priority", "low_priority", or "disqualify"
        """
        
        prompt = f"""Score this lead based on the criteria:
        
        Lead Information: {json.dumps(lead_data)}
        
        Scoring Criteria: {json.dumps(criteria)}
        
        Provide a comprehensive scoring analysis."""
        
        result = self.grok_client.analyze_json(prompt, lead_data, system_prompt)
        
        # Fallback scoring if API fails
        if "error" in result:
            score = 50
            if lead.job_title and any(title in lead.job_title for title in ["CEO", "CTO", "VP", "Director"]):
                score += 20
            if lead.company_size in ["50-200", "200-500", "500-1000"]:
                score += 15
            if lead.industry in criteria["target_industries"]:
                score += 15
                
            return {
                "score": min(score, 100),
                "reasoning": "Scored using fallback algorithm due to API unavailability",
                "strengths": ["Basic criteria met"],
                "weaknesses": ["Manual review recommended"],
                "recommended_action": "medium_priority"
            }
        
        return result