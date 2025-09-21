# Web-UI-Python-SDK Real Integration Guide

## 🎯 Overview

This guide describes how to set up and use the **real** web-ui-python-sdk integration instead of the mock implementation. The system now uses actual Z.AI models (GLM-4.5V and 0727-360B-API) for advanced AI-powered repository analysis and code review.

## 🏗️ Architecture

```
Frontend (React/TypeScript)
├── ChatBubble Component
├── WebUIPythonAdapter (Client)
└── Better-UI Tools
    │
    ▼ HTTP API Calls
Next.js API Routes (/api/python-bridge)
├── Proxy to Python Service
├── Fallback to Mock Implementation
└── Error Handling
    │
    ▼ HTTP/FastAPI
Python FastAPI Service (Port 8000)
├── ZAI Client Integration
├── Real Model Calls
└── Tool Execution
    │
    ▼ HTTPS API Calls
Z.AI Cloud Service
├── GLM-4.5V Model
├── 0727-360B-API Model
└── Advanced AI Capabilities
```

## 🚀 Setup Instructions

### 1. **Python Backend Setup**

```bash
# Navigate to python backend directory
cd python_backend

# Run the setup script (installs dependencies and clones SDK)
chmod +x setup.sh
./setup.sh

# Activate virtual environment
source venv/bin/activate

# Start the Python service
python zai_service.py
```

The Python service will:
- ✅ Install web-ui-python-sdk from GitHub
- ✅ Set up FastAPI server on port 8000
- ✅ Initialize ZAI client with auto-authentication
- ✅ Provide real AI model integration

### 2. **Environment Configuration**

Create `.env` file in the project root:

```env
# Python Service Configuration
PYTHON_SERVICE_URL=http://localhost:8000
PYTHON_SERVICE_TIMEOUT=30000

# Optional: Z.AI Configuration (if needed)
ZAI_API_KEY=your_api_key_here
ZAI_VERBOSE=true
ZAI_TIMEOUT=180
```

### 3. **Frontend Development Server**

```bash
# In the main project directory
npm run dev
```

The Next.js application will:
- ✅ Connect to Python service on startup
- ✅ Proxy requests through /api/python-bridge
- ✅ Fall back to mock if Python service unavailable
- ✅ Display real AI responses in chat bubble

## 🧪 Testing the Integration

### 1. **Health Check Test**

```bash
# Test Python service directly
curl http://localhost:8000/health

# Test through Next.js proxy
curl http://localhost:3001/api/python-bridge/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": 1640995200,
  "pythonSDK": "web-ui-python-sdk",
  "client_ready": true
}
```

### 2. **Chat Integration Test**

Open the application in browser:

1. **Click the chat bubble** in bottom-right corner
2. **Send a test message**: "Analyze the React repository structure"
3. **Verify AI response** with real Z.AI model output
4. **Check for "Python SDK" indicators** in the response

### 3. **Enhanced Tools Test**

Try these prompts in the chat bubble:

```
🔍 Repository Analysis:
"Use the Python SDK to analyze this repository comprehensively"

🛠️ Code Review:
"Review this JavaScript code using advanced AI:
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}"

🧠 AI Thinking:
"Explain the architecture patterns used in this codebase"
```

### 4. **API Endpoint Tests**

```bash
# Test chat completion
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello from the Python SDK!"}],
    "config": {"model": "glm-4.5v", "enableThinking": true}
  }'

# Test tool execution
curl -X POST http://localhost:8000/execute-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "pythonAnalyzeRepository",
    "input": {"owner": "facebook", "repo": "react", "analysisType": "comprehensive"}
  }'
```

## 🔧 Available Models & Capabilities

### **GLM-4.5V Model**
- **Best for**: General chat, explanations, quick analysis
- **Features**: Visual understanding, fast responses
- **Use cases**: Basic repository questions, code explanations

### **0727-360B-API Model**
- **Best for**: Complex analysis, code review, advanced reasoning
- **Features**: Superior coding knowledge, detailed analysis
- **Use cases**: Repository architecture analysis, code review

### **Enhanced Tools**

#### `pythonAnalyzeRepository`
```typescript
{
  owner: "facebook",
  repo: "react", 
  analysisType: "comprehensive", // structure|quality|security|performance
  includeFiles: true,
  maxDepth: 3
}
```

#### `pythonCodeReview`
```typescript
{
  code: "function example() { ... }",
  language: "typescript", // js|ts|python|rust|go|java|cpp
  reviewType: "comprehensive", // security|performance|style|comprehensive
  context: "Optional context about the code"
}
```

## 📊 Real vs Mock Comparison

| Feature | Mock Implementation | Real Python SDK |
|---------|-------------------|-----------------|
| **AI Models** | Static responses | GLM-4.5V, 0727-360B-API |
| **Code Analysis** | Pattern matching | Advanced AI reasoning |
| **Repository Insights** | Basic metrics | Deep architectural analysis |
| **Code Review** | Simple rules | Comprehensive AI review |
| **Thinking Process** | Predefined text | Real AI reasoning chain |
| **Response Quality** | Generic | Context-aware, detailed |
| **Token Usage** | Estimated | Actual usage tracking |

## 🐛 Troubleshooting

### **Python Service Not Starting**

```bash
# Check Python version (requires 3.7+)
python3 --version

# Check if port 8000 is available
lsof -i :8000

# Install missing dependencies
cd python_backend
pip install -r requirements.txt
```

### **ZAI Authentication Issues**

```bash
# Check if auto-authentication works
cd python_backend/web-ui-python-sdk
python example.py

# Check environment variables
env | grep ZAI
```

### **Frontend Connection Issues**

```bash
# Check Next.js environment
cat .env | grep PYTHON_SERVICE

# Test proxy connection
curl -v http://localhost:3001/api/python-bridge/health
```

### **Common Error Messages**

#### "Python service unavailable"
- ✅ Start the Python service: `python python_backend/zai_service.py`
- ✅ Check port 8000 is not blocked
- ✅ Verify PYTHON_SERVICE_URL in .env

#### "ZAI Client initialization failed"
- ✅ Check internet connection
- ✅ Verify web-ui-python-sdk is properly installed
- ✅ Check Z.AI service status

#### "Tool execution failed"
- ✅ Verify tool parameters are valid
- ✅ Check Python service logs
- ✅ Try with simpler inputs first

## 🔄 Development Workflow

### **Making Changes to Python Service**

1. **Modify** `python_backend/zai_service.py`
2. **Restart** Python service (auto-reload enabled in dev mode)
3. **Test** changes through chat bubble
4. **Check logs** for errors or debugging info

### **Adding New AI Tools**

1. **Define tool** in Python service (`zai_service.py`)
2. **Add tool mapping** in `handleToolExecution`
3. **Create frontend tool** in `python-enhanced-tools.ts`
4. **Register tool** in `registry.ts`
5. **Test integration** end-to-end

### **Model Configuration**

```python
# In zai_service.py, modify default config
response = client.simple_chat(
    message=prompt,
    model="0727-360B-API",  # or "glm-4.5v"
    enable_thinking=True,
    temperature=0.3,  # 0.0-2.0 (lower = more focused)
    top_p=0.9,        # 0.0-1.0 (lower = more deterministic) 
    max_tokens=2000   # Response length limit
)
```

## 📈 Performance & Monitoring

### **Response Times**
- **GLM-4.5V**: ~2-5 seconds
- **0727-360B-API**: ~5-15 seconds  
- **Streaming**: Real-time chunks

### **Token Usage**
- Monitor through usage tracking in responses
- Optimize prompts for token efficiency
- Use appropriate model for task complexity

### **Error Rates**
- Check Python service logs
- Monitor Next.js API route responses  
- Track fallback usage statistics

## 🎉 Success Indicators

✅ **Python service starts without errors**
✅ **Health check returns "healthy" status**
✅ **Chat bubble shows real AI responses** 
✅ **Enhanced tools provide detailed analysis**
✅ **Thinking process shows real reasoning**
✅ **Token usage is tracked and reported**
✅ **Response quality significantly improved over mock**

---

**🚀 The real web-ui-python-sdk integration is now live!** 

The chat bubble in the bottom-right corner now connects to actual Z.AI models for advanced repository analysis and code review capabilities. Enjoy the enhanced AI-powered development experience!

## 📞 Support

For issues with:
- **Frontend Integration**: Check Next.js console and network tab
- **Python Service**: Check Python service logs and FastAPI docs at http://localhost:8000/docs  
- **ZAI Models**: Refer to web-ui-python-sdk documentation
- **General Setup**: Follow troubleshooting guide above