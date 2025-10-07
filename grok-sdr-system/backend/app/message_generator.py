# backend/app/message_generator.py
from typing import Dict, Any
import json

class MessageGenerator:
    def __init__(self, grok_client):
        self.grok_client = grok_client
        
    def generate_message(self, lead: Any, message_type: str = "initial_outreach") -> Dict[str, Any]:
        """Generate personalized messages using Grok AI"""

        lead_context = {
            "name": f"{lead.first_name} {lead.last_name}",
            "company": lead.company,
            "job_title": lead.job_title,
            "industry": lead.industry,
            "score": lead.score,
            "notes": lead.notes,
            "pipeline_stage": lead.pipeline_stage
        }
        
        message_templates = {
            "initial_outreach": {
                "tone": "professional and friendly",
                "goal": "introduce our solution and gauge interest",
                "length": "3-4 paragraphs"
            },
            "follow_up": {
                "tone": "warm and persistent",
                "goal": "re-engage and offer value",
                "length": "2-3 paragraphs"
            },
            "meeting_request": {
                "tone": "confident and direct",
                "goal": "schedule a meeting or demo",
                "length": "2-3 paragraphs"
            },
            "value_proposition": {
                "tone": "consultative and insightful",
                "goal": "demonstrate specific value for their business",
                "length": "3-4 paragraphs"
            },
            "casual_check_in": {
                "tone": "informal and conversational",
                "goal": "maintain relationship without being pushy",
                "length": "2 paragraphs"
            },
            "problem_solution": {
                "tone": "educational and helpful",
                "goal": "address a specific pain point with our solution",
                "length": "3-4 paragraphs"
            }
        }
        
        template = message_templates.get(message_type, message_templates["initial_outreach"])

        # Define stage context for better message generation
        stage_contexts = {
            "new": "This is a brand new lead with no prior contact. Focus on making a great first impression.",
            "qualified": "This lead has been qualified as a good fit. They haven't been contacted yet, so this should still be an introduction.",
            "contacted": "We've already made initial contact with this lead. This message should acknowledge prior communication and move the conversation forward.",
            "meeting": "A meeting has been scheduled or recently occurred with this lead. Reference the meeting context and build on momentum.",
            "negotiation": "This lead is actively in negotiations. They understand our value proposition. Focus on addressing specific concerns, ROI, pricing discussions, implementation details, or closing the deal. Be consultative and help them make the decision.",
            "closed_won": "This is now a customer. Focus on onboarding, success, relationship building, or upselling opportunities.",
            "closed_lost": "This opportunity was lost. Keep the door open for future opportunities with a respectful, non-pushy approach."
        }

        stage_context = stage_contexts.get(lead.pipeline_stage, stage_contexts["new"])

        system_prompt = f"""You are an expert B2B sales development representative.
        Create personalized, engaging messages that:
        - Are {template['tone']}
        - {template['goal']}
        - Are approximately {template['length']}
        - Include specific details about the prospect
        - Have a clear call-to-action
        - Feel genuine and not templated
        - IMPORTANT: Take into account the lead's current pipeline stage and relationship history

        Return a JSON object with:
        - subject: compelling email subject line
        - content: the email body (use \n for line breaks)
        - key_points: array of main value propositions mentioned
        - follow_up_timing: suggested days to wait before following up
        """

        prompt = f"""Generate a {message_type} message for this lead:

        Lead Information: {json.dumps(lead_context)}

        PIPELINE STAGE CONTEXT: {stage_context}
        Current Stage: {lead.pipeline_stage}

        Our product is an AI-powered sales automation platform that helps teams:
        - Qualify leads 3x faster
        - Increase conversion rates by 40%
        - Automate repetitive sales tasks
        - Provide data-driven insights

        CRITICAL: Make sure the message tone and content reflects where this lead is in the sales process.
        For example:
        - If they're in "negotiation", don't introduce the product - they already know it. Instead focus on ROI, implementation, addressing concerns, pricing discussions, or moving to close.
        - If they're in "meeting", reference upcoming/past meetings and build on that momentum.
        - If they're "contacted", acknowledge previous communication.
        - If they're "new" or "qualified", this is truly first contact.

        Make it personalized, contextually appropriate, and compelling."""
        
        result = self.grok_client.analyze_json(prompt, lead_context, system_prompt)
        
        # Fallback message if API fails
        if "error" in result:
            fallback_messages = {
                "initial_outreach": {
                    "subject": f"Quick question for {lead.company or 'you'}, {lead.first_name}",
                    "content": f"""Hi {lead.first_name},

I noticed you're {lead.job_title or 'working'} at {lead.company or 'your company'}. Companies in {lead.industry or 'your industry'} often struggle with lengthy sales cycles and manual lead qualification.

Our AI-powered platform has helped similar companies reduce qualification time by 70% while increasing conversion rates. I'd love to share how we specifically helped a company similar to yours achieve these results.

Would you be open to a brief 15-minute call next week to explore if this could benefit your team?

Best regards,
[Your Name]""",
                    "key_points": ["AI-powered qualification", "70% time reduction", "Industry-specific solution"],
                    "follow_up_timing": 3
                },
                "follow_up": {
                    "subject": f"Following up - {lead.first_name}",
                    "content": f"""Hi {lead.first_name},

I wanted to follow up on my previous message about helping {lead.company or 'your team'} streamline your sales process.

I understand you're busy, so I'll keep this brief - would it make sense to have a quick 10-minute call to see if our solution could be a fit?

Looking forward to hearing from you.

Best,
[Your Name]""",
                    "key_points": ["Brief call", "Streamlined sales process"],
                    "follow_up_timing": 5
                }
            }
            
            return fallback_messages.get(message_type, fallback_messages["initial_outreach"])

        return result

    def tune_message(self, lead: Any, original_message: str, instructions: str, message_type: str = "initial_outreach") -> Dict[str, Any]:
        """Tune up an existing message based on user instructions"""

        lead_context = {
            "name": f"{lead.first_name} {lead.last_name}",
            "company": lead.company,
            "job_title": lead.job_title,
            "industry": lead.industry
        }

        system_prompt = f"""You are an expert B2B sales development representative and copywriter.
        Your task is to revise and improve an existing sales message based on specific user instructions.

        Maintain the core message and value proposition, but adjust based on the feedback provided.
        Keep it professional, personalized, and compelling.

        Return a JSON object with:
        - subject: updated email subject line
        - content: the revised email body (use \n for line breaks)
        """

        prompt = f"""Original Message:
{original_message}

Lead Information: {json.dumps(lead_context)}

User Instructions for Revision:
{instructions}

Please revise the message according to the instructions above while keeping it relevant to the lead and maintaining professional quality."""

        result = self.grok_client.analyze_json(prompt, lead_context, system_prompt)

        # Fallback if API fails
        if "error" in result:
            return {
                "subject": f"Revised: Message for {lead.first_name}",
                "content": original_message + f"\n\n[Note: Unable to tune message. Instructions were: {instructions}]"
            }

        return result