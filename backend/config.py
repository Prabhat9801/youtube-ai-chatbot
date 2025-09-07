import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # RAG Configuration
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    SIMILARITY_TOP_K = 4
    
    # Model Configuration
    EMBEDDING_MODEL = "models/embedding-001"
    LLM_MODEL = "gemini-2.0-flash"
    LLM_TEMPERATURE = 0.2