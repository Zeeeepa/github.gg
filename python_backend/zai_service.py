#!/usr/bin/env python3
"""
Z.AI Python SDK Service
Provides a FastAPI backend that integrates with the web-ui-python-sdk
"""

import asyncio
import json
import os
import sys
from typing import List, Dict, Any, Optional, AsyncGenerator
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add the web-ui-python-sdk to the Python path
# Assuming it's cloned in the same directory or installed via pip
try:
    from client import ZAIClient
    from models import MCPFeature
    from custom_models import get_preset, list_presets
except ImportError as e:
    print(f"Error importing ZAI SDK: {e}")
    print("Please ensure the web-ui-python-sdk is installed or available in the Python path")
    sys.exit(1)

# Pydantic models for API
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[float] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    config: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    content: str
    thinking: Optional[str] = None
    model: str
    usage: Optional[Dict[str, int]] = None

class ToolExecutionRequest(BaseModel):
    toolName: str
    input: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class ToolExecutionResponse(BaseModel):
    success: bool
    toolName: str
    result: Optional[Any] = None
    error: Optional[str] = None
    timestamp: float

# Initialize FastAPI app
app = FastAPI(title="ZAI Python SDK Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global ZAI client instance
zai_client: Optional[ZAIClient] = None

def get_zai_client() -> ZAIClient:
    """Get or create ZAI client instance"""
    global zai_client
    if zai_client is None:
        try:
            zai_client = ZAIClient(
                auto_auth=True,
                verbose=os.getenv('ZAI_VERBOSE', 'false').lower() == 'true',
                timeout=int(os.getenv('ZAI_TIMEOUT', '180'))
            )
            print("✅ ZAI Client initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize ZAI Client: {e}")
            raise
    return zai_client

@app.on_startup
async def startup_event():
    """Initialize ZAI client on startup"""
    try:
        get_zai_client()
        print("🚀 ZAI Python SDK Service started successfully")
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        # Don't exit here, allow the service to start in case the client can recover

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        client = get_zai_client()
        return {
            "status": "healthy",
            "timestamp": asyncio.get_event_loop().time(),
            "pythonSDK": "web-ui-python-sdk",
            "client_ready": client is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": asyncio.get_event_loop().time()
        }

@app.get("/tools")
async def list_tools():
    """List available tools"""
    # These are the tools we can execute using the ZAI client
    tools = [
        "analyzeRepositoryStructure",
        "searchRepositoryFiles", 
        "getRepositoryInfo",
        "analyzCodeWithLynlang",
        "compareCodePatterns",
        "analyzePageContext",
        "extractPageContent",
        "pythonAnalyzeRepository",
        "pythonCodeReview"
    ]
    
    return {
        "tools": tools,
        "count": len(tools),
        "presets": list_presets() if 'list_presets' in globals() else []
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """Handle chat completion requests"""
    try:
        client = get_zai_client()
        
        # Convert messages to the format expected by ZAI client
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Extract configuration
        config = request.config
        model = config.get("model", "glm-4.5v")
        enable_thinking = config.get("enableThinking", True)
        temperature = config.get("temperature", 0.7)
        top_p = config.get("topP", 0.9)
        max_tokens = config.get("maxTokens", 2000)
        
        # Get preset if specified
        preset_name = config.get("preset")
        if preset_name and 'get_preset' in globals():
            preset = get_preset(preset_name)
            if preset:
                temperature = preset.get("temperature", temperature)
                top_p = preset.get("top_p", top_p)
                max_tokens = preset.get("max_tokens", max_tokens)
        
        # Use simple_chat for single message or create chat for conversation
        if len(messages) == 1 and messages[0]["role"] == "user":
            response = client.simple_chat(
                message=messages[0]["content"],
                model=model,
                enable_thinking=enable_thinking,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens
            )
        else:
            # For multi-message conversations, use complete_chat
            # First create a chat session
            chat = client.create_chat(
                title="API Chat Session",
                models=[model],
                initial_message=messages[0]["content"] if messages else "Hello",
                enable_thinking=enable_thinking
            )
            
            # Then complete the chat with all messages
            response = client.complete_chat(
                chat_id=chat.get("id") if chat else None,
                messages=messages,
                model=model,
                enable_thinking=enable_thinking,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens
            )
        
        return ChatResponse(
            content=response.content,
            thinking=getattr(response, 'thinking', None),
            model=model,
            usage=getattr(response, 'usage', None)
        )
        
    except Exception as e:
        print(f"❌ Chat completion error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat completion failed: {str(e)}")

@app.post("/chat-stream")
async def chat_stream(request: ChatRequest):
    """Handle streaming chat completion requests"""
    try:
        client = get_zai_client()
        
        # Convert messages
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Extract configuration
        config = request.config
        model = config.get("model", "glm-4.5v")
        enable_thinking = config.get("enableThinking", True)
        temperature = config.get("temperature", 0.7)
        top_p = config.get("topP", 0.9)
        max_tokens = config.get("maxTokens", 2000)
        
        async def generate_stream():
            try:
                # Create a chat session for streaming
                chat = client.create_chat(
                    title="Streaming Chat Session",
                    models=[model],
                    initial_message=messages[0]["content"] if messages else "Hello",
                    enable_thinking=enable_thinking
                )
                
                chat_id = chat.get("id") if chat else "default"
                
                # Stream the completion
                for chunk in client.stream_completion(
                    chat_id=chat_id,
                    messages=messages,
                    model=model,
                    enable_thinking=enable_thinking,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=max_tokens
                ):
                    data = {
                        "delta": chunk.delta_content if hasattr(chunk, 'delta_content') else str(chunk),
                        "phase": chunk.phase if hasattr(chunk, 'phase') else "answer"
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    
            except Exception as e:
                error_data = {"error": str(e), "phase": "error"}
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/stream-event"
            }
        )
        
    except Exception as e:
        print(f"❌ Streaming error: {e}")
        raise HTTPException(status_code=500, detail=f"Streaming failed: {str(e)}")

@app.post("/execute-tool", response_model=ToolExecutionResponse)
async def execute_tool(request: ToolExecutionRequest):
    """Execute a tool using ZAI client for enhanced AI analysis"""
    try:
        client = get_zai_client()
        
        tool_name = request.toolName
        tool_input = request.input
        context = request.context or {}
        
        # Map tool execution to ZAI client capabilities
        if tool_name in ["pythonAnalyzeRepository", "analyzeRepositoryStructure"]:
            # Use ZAI for repository analysis
            owner = tool_input.get("owner", "")
            repo = tool_input.get("repo", "")
            analysis_type = tool_input.get("analysisType", "structure")
            
            prompt = f"""Analyze the GitHub repository {owner}/{repo} with focus on {analysis_type}.
            Please provide:
            1. Overall repository structure and organization
            2. Key technologies and frameworks used  
            3. Code quality assessment
            4. Architecture patterns identified
            5. Potential improvements or issues
            
            Be specific and actionable in your analysis."""
            
            response = client.simple_chat(
                message=prompt,
                model="0727-360B-API",  # Use the more advanced model for analysis
                enable_thinking=True,
                temperature=0.3  # Lower temperature for more focused analysis
            )
            
            result = {
                "success": True,
                "source": "zai-python-sdk",
                "repository": f"{owner}/{repo}",
                "analysisType": analysis_type,
                "analysis": response.content,
                "thinking": getattr(response, 'thinking', None),
                "model": "0727-360B-API",
                "metadata": {
                    "timestamp": asyncio.get_event_loop().time(),
                    "tokensUsed": getattr(response, 'usage', {}).get('total_tokens', 0) if hasattr(response, 'usage') else 0
                }
            }
            
        elif tool_name in ["pythonCodeReview"]:
            # Use ZAI for code review
            code = tool_input.get("code", "")
            language = tool_input.get("language", "typescript")
            review_type = tool_input.get("reviewType", "comprehensive")
            context_info = tool_input.get("context", "")
            
            prompt = f"""Please review this {language} code with focus on {review_type} aspects:

{context_info and f'Context: {context_info}' or ''}

Code:
```{language}
{code}
```

Please provide:
1. Code quality assessment
2. Security considerations
3. Performance implications  
4. Best practices adherence
5. Specific improvement suggestions
6. Potential bugs or issues

Be detailed and actionable in your feedback."""
            
            response = client.simple_chat(
                message=prompt,
                model="0727-360B-API",
                enable_thinking=True,
                temperature=0.2  # Very focused for code review
            )
            
            result = {
                "success": True,
                "review": response.content,
                "thinking": getattr(response, 'thinking', None),
                "language": language,
                "reviewType": review_type,
                "model": "0727-360B-API",
                "codeLength": len(code),
                "timestamp": asyncio.get_event_loop().time()
            }
            
        else:
            # For other tools, provide a general AI-powered analysis
            tool_description = f"Execute {tool_name} with parameters: {json.dumps(tool_input, indent=2)}"
            
            response = client.simple_chat(
                message=f"Help with this development task: {tool_description}. Please provide practical assistance and guidance.",
                model="glm-4.5v",
                enable_thinking=False,
                temperature=0.7
            )
            
            result = {
                "success": True,
                "content": response.content,
                "model": "glm-4.5v",
                "timestamp": asyncio.get_event_loop().time()
            }
        
        return ToolExecutionResponse(
            success=True,
            toolName=tool_name,
            result=result,
            timestamp=asyncio.get_event_loop().time()
        )
        
    except Exception as e:
        print(f"❌ Tool execution error: {e}")
        return ToolExecutionResponse(
            success=False,
            toolName=request.toolName,
            error=str(e),
            timestamp=asyncio.get_event_loop().time()
        )

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting ZAI Python SDK Service on {host}:{port}")
    
    uvicorn.run(
        "zai_service:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT", "development") == "development",
        log_level="info"
    )