# backend/app/grok_client.py
import httpx
import json
from typing import Dict, Any, Optional
import os

class GrokClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.x.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self) -> bool:
        """Test if the Grok API connection is working"""
        if not self.api_key:
            return False
            
        try:
            response = httpx.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "grok-3",  # CHANGED FROM grok-beta
                    "messages": [{"role": "user", "content": "Hi"}],
                    "max_tokens": 5
                },
                timeout=5.0
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Grok connection test failed: {e}")
            return False
    
    def chat_completion(self, messages: list, temperature: float = 0.7, max_tokens: int = 1000) -> Dict[str, Any]:
        """Send a chat completion request to Grok"""
        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "grok-3",  # CHANGED FROM grok-beta
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {
                        "error": f"API request failed with status {response.status_code}",
                        "details": response.text
                    }
        except Exception as e:
            return {"error": str(e)}
    
    def analyze_json(self, prompt: str, data: Dict, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Analyze data and return structured JSON response"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({
            "role": "user",
            "content": f"{prompt}\n\nData: {json.dumps(data)}\n\nRespond with valid JSON only."
        })
        
        result = self.chat_completion(messages, temperature=0.3)
        
        if "error" in result:
            return result
        
        try:
            content = result["choices"][0]["message"]["content"]
            # Try to parse JSON from the response
            return json.loads(content)
        except:
            return {"error": "Failed to parse JSON response", "raw": content}
