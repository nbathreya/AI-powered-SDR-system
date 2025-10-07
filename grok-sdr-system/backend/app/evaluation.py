# backend/app/evaluation.py
"""Simple evaluation framework for testing Grok performance"""

class GrokEvaluator:
    def __init__(self, grok_client):
        self.grok_client = grok_client
        self.test_results = []
    
    def test_lead_scoring_consistency(self):
        """Test if lead scoring is consistent"""
        test_lead = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@techcorp.com",
            "company": "TechCorp",
            "job_title": "VP of Sales",
            "industry": "Technology",
            "company_size": "200-500"
        }
        
        scores = []
        for i in range(3):
            result = self.grok_client.analyze_json(
                "Score this lead from 0-100",
                test_lead,
                "You are a lead scoring AI. Return JSON with 'score' field."
            )
            if "score" in result:
                scores.append(result["score"])
        
        if scores:
            variance = max(scores) - min(scores)
            return {
                "test": "scoring_consistency",
                "passed": variance < 10,
                "scores": scores,
                "variance": variance
            }
        return {"test": "scoring_consistency", "passed": False, "error": "No scores generated"}
    
    def test_message_personalization(self):
        """Test if messages are properly personalized"""
        test_leads = [
            {"name": "Alice", "company": "FinTech Inc", "industry": "Finance"},
            {"name": "Bob", "company": "HealthCo", "industry": "Healthcare"}
        ]
        
        messages = []
        for lead in test_leads:
            result = self.grok_client.analyze_json(
                "Generate a sales outreach message",
                lead,
                "Generate personalized sales message. Return JSON with 'content' field."
            )
            if "content" in result:
                messages.append(result["content"])
        
        # Check if messages are different and contain personalized elements
        if len(messages) == 2:
            personalized = (
                messages[0] != messages[1] and
                "FinTech" in messages[0] and
                "HealthCo" in messages[1]
            )
            return {
                "test": "message_personalization",
                "passed": personalized,
                "message_count": len(messages)
            }
        return {"test": "message_personalization", "passed": False}
    
    def run_all_tests(self):
        """Run all evaluation tests"""
        results = []
        results.append(self.test_lead_scoring_consistency())
        results.append(self.test_message_personalization())
        
        return {
            "total_tests": len(results),
            "passed": sum(1 for r in results if r.get("passed", False)),
            "results": results
        }