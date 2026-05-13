import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    CEREBRAS_API_KEY = os.getenv('CEREBRAS_API_KEY')
    CEREBRAS_BASE_URL = os.getenv('CEREBRAS_BASE_URL', 'https://api.cerebras.ai/v1')
    APP_ENV = os.getenv('APP_ENV', 'development')
    DEBUG = APP_ENV == 'development'
    
    # RAG Configuration
    CHUNK_SIZE = int(os.getenv('CHUNK_SIZE', '500'))
    CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '50'))
    SIMILARITY_TOP_K = int(os.getenv('SIMILARITY_TOP_K', '4'))
    
    # Model Configuration
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'BAAI/bge-small-en-v1.5')
    LLM_MODEL = os.getenv('LLM_MODEL', 'llama3.1-8b')
    LLM_TEMPERATURE = float(os.getenv('LLM_TEMPERATURE', '0.2'))