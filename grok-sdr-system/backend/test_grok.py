import os
from dotenv import load_dotenv
import httpx

load_dotenv()

def test_grok_api():
    api_key = os.getenv("GROK_API_KEY")
    print(f"API Key from .env: {api_key}")
    
    # Test different key formats
    keys_to_test = [
        api_key,  # As-is
        f"xai-{api_key}" if api_key and not api_key.startswith("xai-") else api_key,  # With prefix
    ]
    
    for test_key in keys_to_test:
        print(f"\nTesting with key format: {test_key[:20]}...")
        
        headers = {
            "Authorization": f"Bearer {test_key}",
            "Content-Type": "application/json"
        }
        
        try:
            # Test with minimal request
            response = httpx.post(
                "https://api.x.ai/v1/chat/completions",
                headers=headers,
                json={
                    "model": "grok-3",
                    "messages": [{"role": "user", "content": "Say 'hi'"}],
                    "max_tokens": 5,
                    "temperature": 0.1
                },
                timeout=10.0
            )
            
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("SUCCESS! This key format works!")
                print(f"Response: {response.json()}")
                return True
            else:
                print(f"Failed: {response.text[:200]}")
                
        except Exception as e:
            print(f"Error: {e}")
    
    return False

if __name__ == "__main__":
    success = test_grok_api()
    if not success:
        print("\n❌ Could not connect to Grok API")
        print("Please check:")
        print("1. Your API key is correct")
        print("2. You have credits remaining")
        print("3. Try the key with and without 'xai-' prefix")
    else:
        print("\n✅ Grok API is working!")

# Run this with:
# cd backend
# python test_grok.py