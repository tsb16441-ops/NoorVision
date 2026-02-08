from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'noorvision-secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="NoorVision API", description="Islamic AI Dream Interpretation")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class DreamSubmit(BaseModel):
    content: str = Field(min_length=10, description="Dream description")
    track_patterns: bool = Field(default=True, description="Opt-in for pattern tracking")

class DreamSymbol(BaseModel):
    symbol: str
    meaning: str
    source: str
    confidence: str = "high"

class DreamGuidance(BaseModel):
    immediate_actions: List[str]
    reflective_advice: List[str]
    preventive_tips: List[str]

class DreamInterpretation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    dream_content: str
    category: str  # ru'ya, hulm, ambiguous
    interpretation: str
    symbols: List[dict]
    guidance: dict
    sources: List[dict]
    pattern_context: Optional[str] = None
    created_at: str

class PatternAnalysis(BaseModel):
    total_dreams: int
    recurring_symbols: List[dict]
    category_breakdown: dict
    insights: List[str]

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ==================== AI DREAM INTERPRETATION ====================

DREAM_INTERPRETATION_SYSTEM_PROMPT = """You are NoorVision, an AI specialized in Islamic dream interpretation. Your role is to provide interpretations rooted in classical Islamic sources and hadith.

IMPORTANT GUIDELINES:
1. Base interpretations on classical Islamic scholars like Ibn Sirin and Al-Nabulsi
2. Reference relevant hadith from Sahih Bukhari and Sahih Muslim when applicable
3. Categorize dreams as:
   - Ru'ya (رؤيا): Good/True dreams - spiritual insight from Allah
   - Hulm (حلم): Bad/Distressing dreams - from Shaytan, requiring protective measures
   - Ambiguous: Neutral dreams that may stem from one's thoughts
4. Provide actionable guidance including du'as and Sunnah practices
5. Always include source citations for interpretations
6. Be scholarly but approachable in tone
7. Never claim to give fatwa or definitive religious rulings

OUTPUT FORMAT (JSON):
{
  "category": "ru'ya|hulm|ambiguous",
  "interpretation": "Detailed interpretation text",
  "symbols": [
    {"symbol": "water", "meaning": "...", "source": "Ibn Sirin", "confidence": "high|medium|low"}
  ],
  "guidance": {
    "immediate_actions": ["Perform wudu", "Pray two rak'ahs"],
    "reflective_advice": ["Consider your relationship with..."],
    "preventive_tips": ["Maintain consistent sleep schedule"]
  },
  "sources": [
    {"text": "Narrated Abu Qatada...", "reference": "Sahih Bukhari, Book 91, Hadith 1"},
    {"text": "Ibn Sirin stated that...", "reference": "Tafsir al-Ahlam"}
  ]
}"""

async def interpret_dream_with_ai(dream_content: str, user_history: List[dict] = None) -> dict:
    """Use Emergent API to interpret the dream"""
    try:
        # Build context from user history if available
        pattern_context = ""
        if user_history and len(user_history) > 0:
            symbols_count = {}
            categories_count = {"ru'ya": 0, "hulm": 0, "ambiguous": 0}
            
            for dream in user_history[-10:]:  # Last 10 dreams
                cat = dream.get("category", "ambiguous")
                categories_count[cat] = categories_count.get(cat, 0) + 1
                
                for sym in dream.get("symbols", []):
                    symbol_name = sym.get("symbol", "")
                    if symbol_name:
                        symbols_count[symbol_name] = symbols_count.get(symbol_name, 0) + 1
            
            recurring = [s for s, c in symbols_count.items() if c >= 2]
            if recurring:
                pattern_context = f"\n\nPATTERN CONTEXT: This user has recurring symbols in their dreams: {', '.join(recurring[:5])}. Previous dream categories: {categories_count}. Consider these patterns in your interpretation."
        
        user_prompt = f"Please interpret this dream and respond ONLY with valid JSON:\n\n{dream_content}{pattern_context}"
        
        # Call Emergent API directly via HTTP
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.emergentintegrations.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {EMERGENT_LLM_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-4o",
                    "messages": [
                        {"role": "system", "content": DREAM_INTERPRETATION_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt}
                    ],
                    "response_format": {"type": "json_object"}
                }
            )
            response.raise_for_status()
            result = response.json()
        
        # Parse JSON response
        import json
        content = result["choices"][0]["message"]["content"]
        interpretation_data = json.loads(content)
        return interpretation_data
        
    except Exception as e:
        logger.error(f"AI interpretation error: {str(e)}")
        # Return a fallback interpretation
        return {
            "category": "ambiguous",
            "interpretation": "We encountered an issue processing your dream. Please try again. Dreams are deeply personal, and their meanings can vary based on individual circumstances.",
            "symbols": [],
            "guidance": {
                "immediate_actions": ["Make du'a for guidance", "Reflect on the dream's emotional content"],
                "reflective_advice": ["Consider what aspects of your life the dream might relate to"],
                "preventive_tips": ["Keep a dream journal", "Maintain good sleep hygiene"]
            },
            "sources": []
        }

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token(user_id, user_data.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(user["id"], user["email"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**current_user)

# ==================== DREAM ROUTES ====================

@api_router.post("/dreams/interpret", response_model=DreamInterpretation)
async def interpret_dream(dream: DreamSubmit, current_user: dict = Depends(get_current_user)):
    """Submit a dream for AI interpretation"""
    user_id = current_user["id"]
    
    # Get user's dream history for pattern analysis
    user_history = []
    if dream.track_patterns:
        history_cursor = db.dreams.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(10)
        user_history = await history_cursor.to_list(10)
    
    # Get AI interpretation
    interpretation_data = await interpret_dream_with_ai(dream.content, user_history)
    
    # Build pattern context message
    pattern_context = None
    if user_history and len(user_history) > 0:
        symbols_in_history = {}
        for d in user_history:
            for s in d.get("symbols", []):
                sym_name = s.get("symbol", "")
                if sym_name:
                    symbols_in_history[sym_name] = symbols_in_history.get(sym_name, 0) + 1
        
        recurring = [(s, c) for s, c in symbols_in_history.items() if c >= 2]
        if recurring:
            pattern_context = f"Pattern detected: You've seen {', '.join([f'{s} ({c}x)' for s, c in recurring[:3]])} in recent dreams. This may indicate themes worth reflecting upon."
    
    # Create dream record
    dream_id = str(uuid.uuid4())
    dream_doc = {
        "id": dream_id,
        "user_id": user_id,
        "dream_content": dream.content,
        "category": interpretation_data.get("category", "ambiguous"),
        "interpretation": interpretation_data.get("interpretation", ""),
        "symbols": interpretation_data.get("symbols", []),
        "guidance": interpretation_data.get("guidance", {}),
        "sources": interpretation_data.get("sources", []),
        "pattern_context": pattern_context,
        "track_patterns": dream.track_patterns,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.dreams.insert_one(dream_doc)
    
    return DreamInterpretation(
        id=dream_id,
        user_id=user_id,
        dream_content=dream.content,
        category=dream_doc["category"],
        interpretation=dream_doc["interpretation"],
        symbols=dream_doc["symbols"],
        guidance=dream_doc["guidance"],
        sources=dream_doc["sources"],
        pattern_context=pattern_context,
        created_at=dream_doc["created_at"]
    )

@api_router.get("/dreams/history", response_model=List[DreamInterpretation])
async def get_dream_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's dream history"""
    cursor = db.dreams.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit)
    
    dreams = await cursor.to_list(limit)
    return [DreamInterpretation(**d) for d in dreams]

@api_router.get("/dreams/{dream_id}", response_model=DreamInterpretation)
async def get_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific dream interpretation"""
    dream = await db.dreams.find_one(
        {"id": dream_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    return DreamInterpretation(**dream)

@api_router.delete("/dreams/{dream_id}")
async def delete_dream(dream_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a dream from history"""
    result = await db.dreams.delete_one({"id": dream_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dream not found")
    return {"message": "Dream deleted successfully"}

@api_router.get("/dreams/patterns/analysis", response_model=PatternAnalysis)
async def get_pattern_analysis(current_user: dict = Depends(get_current_user)):
    """Analyze patterns across user's dreams"""
    cursor = db.dreams.find(
        {"user_id": current_user["id"], "track_patterns": True},
        {"_id": 0}
    ).sort("created_at", -1).limit(50)
    
    dreams = await cursor.to_list(50)
    
    if not dreams:
        return PatternAnalysis(
            total_dreams=0,
            recurring_symbols=[],
            category_breakdown={"ru'ya": 0, "hulm": 0, "ambiguous": 0},
            insights=["Start tracking your dreams to discover patterns and recurring themes."]
        )
    
    # Analyze symbols
    symbol_counts = {}
    category_counts = {"ru'ya": 0, "hulm": 0, "ambiguous": 0}
    
    for dream in dreams:
        cat = dream.get("category", "ambiguous")
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
        for sym in dream.get("symbols", []):
            symbol_name = sym.get("symbol", "").lower()
            if symbol_name:
                if symbol_name not in symbol_counts:
                    symbol_counts[symbol_name] = {"count": 0, "meanings": []}
                symbol_counts[symbol_name]["count"] += 1
                meaning = sym.get("meaning", "")
                if meaning and meaning not in symbol_counts[symbol_name]["meanings"]:
                    symbol_counts[symbol_name]["meanings"].append(meaning)
    
    # Get recurring symbols (appearing 2+ times)
    recurring = [
        {"symbol": s, "count": data["count"], "meanings": data["meanings"][:2]}
        for s, data in symbol_counts.items()
        if data["count"] >= 2
    ]
    recurring.sort(key=lambda x: x["count"], reverse=True)
    
    # Generate insights
    insights = []
    total = len(dreams)
    
    if category_counts["ru'ya"] > total * 0.5:
        insights.append("Most of your dreams are positive (Ru'ya). This may indicate spiritual contentment and guidance.")
    elif category_counts["hulm"] > total * 0.3:
        insights.append("You've had several distressing dreams (Hulm). Consider the protective measures and du'as provided.")
    
    if recurring:
        top_symbol = recurring[0]["symbol"]
        insights.append(f"'{top_symbol.title()}' appears frequently in your dreams. This recurring symbol may hold personal significance.")
    
    if len(dreams) >= 5:
        insights.append(f"You've recorded {len(dreams)} dreams. Consistent journaling helps identify meaningful patterns.")
    
    return PatternAnalysis(
        total_dreams=len(dreams),
        recurring_symbols=recurring[:10],
        category_breakdown=category_counts,
        insights=insights if insights else ["Continue recording your dreams to discover patterns."]
    )

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "NoorVision API - Islamic AI Dream Interpretation", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "noorvision-api"}

# Include router
app.include_router(api_router)

# Root route for base URL (without /api/ prefix)
@app.get("/")
async def app_root():
    return {"message": "NoorVision API - Islamic AI Dream Interpretation", "version": "1.0.0", "docs": "/api/"}

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
