#!/usr/bin/env python3
"""
Test script for web-ui-python-sdk integration
Validates that the ZAI client works correctly
"""

import asyncio
import json
import sys
import time
from pathlib import Path

# Add the web-ui-python-sdk to the path
sdk_path = Path(__file__).parent / 'web-ui-python-sdk'
if sdk_path.exists():
    sys.path.insert(0, str(sdk_path))

try:
    from client import ZAIClient
    print("✅ Successfully imported ZAIClient")
except ImportError as e:
    print(f"❌ Failed to import ZAIClient: {e}")
    print("Please run setup.sh first to install the web-ui-python-sdk")
    sys.exit(1)

async def test_zai_client():
    """Test the ZAI client functionality"""
    
    print("\n🚀 Testing ZAI Client Integration...")
    
    try:
        # Initialize client
        print("📦 Initializing ZAI Client...")
        client = ZAIClient(auto_auth=True, verbose=True)
        print("✅ ZAI Client initialized successfully")
        
        # Test simple chat
        print("\n💬 Testing simple chat...")
        response = client.simple_chat(
            message="Hello! Can you help me analyze code?",
            model="glm-4.5v",
            enable_thinking=True,
            temperature=0.7
        )
        
        print(f"✅ Chat Response: {response.content[:100]}...")
        if hasattr(response, 'thinking') and response.thinking:
            print(f"🧠 Thinking: {response.thinking[:100]}...")
        
        # Test repository analysis prompt
        print("\n🔍 Testing repository analysis...")
        analysis_response = client.simple_chat(
            message="""Analyze the structure and quality of the React repository (facebook/react).
            Focus on:
            1. Overall architecture and organization
            2. Key patterns and conventions used
            3. Code quality indicators
            4. Areas for improvement
            
            Provide specific, actionable insights.""",
            model="0727-360B-API",  # Use advanced model
            enable_thinking=True,
            temperature=0.3
        )
        
        print(f"✅ Analysis Response: {analysis_response.content[:200]}...")
        
        # Test code review
        print("\n🛠️ Testing code review...")
        code_review_response = client.simple_chat(
            message="""Please review this JavaScript code:

```javascript
function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    return total;
}
```

Focus on:
1. Code quality and best practices
2. Performance considerations  
3. Security implications
4. Improvement suggestions""",
            model="0727-360B-API",
            enable_thinking=True,
            temperature=0.2
        )
        
        print(f"✅ Code Review Response: {code_review_response.content[:200]}...")
        
        # Test available models and presets
        print("\n📋 Testing model capabilities...")
        
        try:
            from custom_models import list_presets, get_preset
            presets = list_presets()
            print(f"✅ Available presets: {presets}")
            
            if presets:
                preset = get_preset(presets[0])
                print(f"✅ Sample preset '{presets[0]}': {preset}")
        except ImportError:
            print("⚠️ Custom models not available (this is okay)")
        
        print("\n🎉 All tests passed successfully!")
        print("The web-ui-python-sdk integration is working correctly.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("Please check:")
        print("1. Internet connection is available")
        print("2. web-ui-python-sdk is properly installed") 
        print("3. Z.AI service is accessible")
        return False

def test_fastapi_service():
    """Test the FastAPI service endpoints"""
    
    print("\n🌐 Testing FastAPI Service Integration...")
    
    try:
        import requests
        
        base_url = "http://localhost:8000"
        
        # Test health endpoint
        print("🔍 Testing health endpoint...")
        health_response = requests.get(f"{base_url}/health", timeout=10)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"✅ Health check: {health_data['status']}")
        else:
            print(f"❌ Health check failed: {health_response.status_code}")
            return False
        
        # Test tools endpoint
        print("🛠️ Testing tools endpoint...")
        tools_response = requests.get(f"{base_url}/tools", timeout=10)
        if tools_response.status_code == 200:
            tools_data = tools_response.json()
            print(f"✅ Available tools: {len(tools_data.get('tools', []))}")
        else:
            print(f"❌ Tools endpoint failed: {tools_response.status_code}")
        
        # Test chat endpoint
        print("💬 Testing chat endpoint...")
        chat_data = {
            "messages": [
                {"role": "user", "content": "Hello from the test script!"}
            ],
            "config": {
                "model": "glm-4.5v",
                "enableThinking": True,
                "temperature": 0.7
            }
        }
        
        chat_response = requests.post(f"{base_url}/chat", json=chat_data, timeout=30)
        if chat_response.status_code == 200:
            response_data = chat_response.json()
            print(f"✅ Chat response: {response_data.get('content', 'No content')[:100]}...")
        else:
            print(f"❌ Chat endpoint failed: {chat_response.status_code}")
            return False
        
        print("✅ FastAPI service is working correctly!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to FastAPI service")
        print("Please start the service with: python zai_service.py")
        return False
    except Exception as e:
        print(f"❌ FastAPI test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Web-UI-Python-SDK Integration Test")
    print("=" * 50)
    
    # Test ZAI client directly
    success = asyncio.run(test_zai_client())
    
    if success:
        print("\n" + "=" * 50)
        # Test FastAPI service if available
        test_fastapi_service()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Integration test completed successfully!")
        print("You can now start the FastAPI service and use the chat bubble.")
    else:
        print("❌ Integration test failed.")
        print("Please check the troubleshooting guide in PYTHON_SDK_INTEGRATION.md")
    
    print("\nNext steps:")
    print("1. Start Python service: python zai_service.py")
    print("2. Start Next.js dev server: npm run dev") 
    print("3. Open http://localhost:3001 and test the chat bubble")