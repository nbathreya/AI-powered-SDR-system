# backend/generate_sample_data.py
"""
Sample data generator for demo purposes
Run this after starting the backend to populate with sample leads
"""

import requests
import random
import time

API_URL = "http://localhost:8001/api"

sample_leads = [
    {
        "first_name": "John",
        "last_name": "Smith",
        "email": "john.smith@techcorp.com",
        "company": "TechCorp Solutions",
        "job_title": "VP of Sales",
        "industry": "Technology",
        "company_size": "200-500",
        "location": "San Francisco, CA",
        "phone": "+1-415-555-0100"
    },
    {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah.j@innovate.io",
        "company": "Innovate.io",
        "job_title": "Chief Technology Officer",
        "industry": "Technology",
        "company_size": "50-200",
        "location": "Austin, TX",
        "phone": "+1-512-555-0101"
    },
    {
        "first_name": "Michael",
        "last_name": "Chen",
        "email": "m.chen@globalfinance.com",
        "company": "Global Finance Inc",
        "job_title": "Director of Operations",
        "industry": "Finance",
        "company_size": "500+",
        "location": "New York, NY",
        "phone": "+1-212-555-0102"
    },
    {
        "first_name": "Emily",
        "last_name": "Williams",
        "email": "emily.williams@healthtech.med",
        "company": "HealthTech Medical",
        "job_title": "CEO",
        "industry": "Healthcare",
        "company_size": "50-200",
        "location": "Boston, MA",
        "phone": "+1-617-555-0103"
    },
    {
        "first_name": "David",
        "last_name": "Martinez",
        "email": "d.martinez@retailplus.com",
        "company": "RetailPlus",
        "job_title": "Sales Manager",
        "industry": "Retail",
        "company_size": "11-50",
        "location": "Chicago, IL",
        "phone": "+1-312-555-0104"
    },
    {
        "first_name": "Jessica",
        "last_name": "Taylor",
        "email": "jessica.t@cloudsys.net",
        "company": "CloudSys Networks",
        "job_title": "VP of Engineering",
        "industry": "Technology",
        "company_size": "201-500",
        "location": "Seattle, WA",
        "phone": "+1-206-555-0105"
    },
    {
        "first_name": "Robert",
        "last_name": "Anderson",
        "email": "r.anderson@manufactureco.com",
        "company": "ManufactureCo",
        "job_title": "Head of Procurement",
        "industry": "Manufacturing",
        "company_size": "500+",
        "location": "Detroit, MI",
        "phone": "+1-313-555-0106"
    },
    {
        "first_name": "Lisa",
        "last_name": "Thompson",
        "email": "lisa@startupventures.io",
        "company": "Startup Ventures",
        "job_title": "Founder & CEO",
        "industry": "Technology",
        "company_size": "1-10",
        "location": "Palo Alto, CA",
        "phone": "+1-650-555-0107"
    },
    {
        "first_name": "James",
        "last_name": "Wilson",
        "email": "james.wilson@enterprisecorp.com",
        "company": "Enterprise Corp",
        "job_title": "Director of Sales",
        "industry": "Finance",
        "company_size": "500+",
        "location": "Charlotte, NC",
        "phone": "+1-704-555-0108"
    },
    {
        "first_name": "Amanda",
        "last_name": "Garcia",
        "email": "amanda.g@datanalytics.ai",
        "company": "DataAnalytics AI",
        "job_title": "CTO",
        "industry": "Technology",
        "company_size": "51-200",
        "location": "Denver, CO",
        "phone": "+1-303-555-0109"
    }
]

def generate_sample_data():
    print("🚀 Generating sample data...")
    
    created_leads = []
    
    for i, lead_data in enumerate(sample_leads):
        try:
            # Create lead
            response = requests.post(f"{API_URL}/leads", json=lead_data)
            if response.status_code == 200:
                lead = response.json()
                created_leads.append(lead)
                print(f"✅ Created lead {i+1}/{len(sample_leads)}: {lead['first_name']} {lead['last_name']}")
            else:
                print(f"❌ Failed to create lead: {response.text}")
        except Exception as e:
            print(f"❌ Error creating lead: {e}")
        
        # Small delay to avoid overwhelming the API
        time.sleep(0.5)
    
    print("\n📊 Scoring all leads...")
    try:
        response = requests.post(f"{API_URL}/leads/score-batch")
        if response.status_code == 200:
            print("✅ All leads scored successfully!")
        else:
            print(f"❌ Failed to score leads: {response.text}")
    except Exception as e:
        print(f"❌ Error scoring leads: {e}")
    
    # Update some leads to different pipeline stages for demo
    if created_leads:
        print("\n🔄 Setting up pipeline stages for demo...")
        stages = ["qualified", "contacted", "meeting", "negotiation"]
        
        for i, lead in enumerate(created_leads[:4]):
            try:
                stage = stages[i % len(stages)]
                response = requests.put(
                    f"{API_URL}/leads/{lead['id']}/stage",
                    json={"stage": stage, "notes": f"Moved to {stage} for demo"}
                )
                if response.status_code == 200:
                    print(f"✅ Moved {lead['first_name']} to {stage}")
            except Exception as e:
                print(f"❌ Error updating stage: {e}")
    
    print("\n✨ Sample data generation complete!")
    print(f"📊 Created {len(created_leads)} leads")
    print("🎯 You can now view the leads in the frontend at http://localhost:5173")

if __name__ == "__main__":
    # Check if backend is running
    try:
        response = requests.get(f"{API_URL[:-4]}/health")
        if response.status_code == 200:
            generate_sample_data()
        else:
            print("⚠️  Backend is not responding correctly")
    except:
        print("❌ Backend is not running. Please start it first:")
        print("   cd backend && source venv/bin/activate && uvicorn app.main:app --reload")