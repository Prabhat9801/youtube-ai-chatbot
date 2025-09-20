import os
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class RAGSystem:
    def __init__(self):
        # self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200
        )
        self.vector_stores = {}  # Store vector stores for different videos
        self.setup_prompt()
        
    def setup_prompt(self):
        self.prompt = PromptTemplate(
            template="""
            You are a helpful AI assistant for YouTube videos. Format your responses using these structured formats based on the content type:

            1. General Structure:
               # Main Title
               ## Subtitles for Sections
               ### Sub-sections when needed

            2. Lists and Steps:
               - Use "1. " for sequential steps
               - Use "- " for unordered lists
               - Use "  - " for nested sub-points

            3. Important Elements:
               - Wrap key terms in **bold**
               - Use `code` for technical terms
               - Use > for important quotes or highlights
               - Use --- for section breaks

            4. Tables (for comparisons):
               For clean, structured tables always:
               - Start with "# Table: [Title]"
               - Use consistent column widths
               - Put the comparison criteria in the first column
               - Format as:
               | Criteria | Category 1 | Category 2 |
               |----------|------------|------------|
               | Point 1  | Details    | Details    |

            5. Code Blocks (for technical content):
               ```language
               code goes here
               ```

            6. Timeline Format:
               [Time/Date] Event or Point
               │
               [Time/Date] Next Event
               │
               [Time/Date] Final Event

            7. Definition Lists:
               Term
               : Definition or explanation
               : Additional information

            Choose the most appropriate format(s) for each response. Mix formats when needed for better clarity.

            Context from video transcript:
            {context}
            
            Human: {question}
            
            Assistant:
            
            Example format:
            # Main Topic
            
            ## Overview
            Brief introduction here
            
            ## Key Points
            1. First important point
            2. Second important point with **key term**
            3. Third important point
            
            ## Details
            More detailed explanation...

            Answer ONLY from the provided transcript context.
            If the context is insufficient, say you don't know and suggest a more specific question.
            
            Context from video transcript:
            {context}
            
            Human: {question}
            
            Assistant:""",
            input_variables=['context', 'question']
        )
        
    def get_video_transcript(self, video_id):
        """Extract transcript from YouTube video"""
       
        try:
            ytt_api = YouTubeTranscriptApi()
            transcript_list = ytt_api.fetch(video_id, languages=["en"])
            transcript = " ".join(chunk.text for chunk in transcript_list)
            return transcript
        except TranscriptsDisabled:
            logger.warning(f"No captions available for video {video_id}")
            return None
        except Exception as e:
            logger.error(f"Error getting transcript for {video_id}: {str(e)}")
            return None
    
    def process_video(self, video_id):
        """Process video transcript and create vector store"""
        if video_id in self.vector_stores:
            return {"status": "already_processed", "video_id": video_id}
        
        transcript = self.get_video_transcript(video_id)
        if not transcript:
            return {"status": "error", "message": "Could not get transcript"}
        
        # Split text into chunks
        chunks = self.text_splitter.create_documents([transcript])
        
        # Create vector store
        vector_store = FAISS.from_documents(chunks, self.embeddings)
        self.vector_stores[video_id] = vector_store
        
        logger.info(f"Processed video {video_id} with {len(chunks)} chunks")
        return {"status": "processed", "video_id": video_id, "chunks": len(chunks)}
    
    def format_docs(self, retrieved_docs):
        """Format retrieved documents for prompt"""
        return "\n\n".join(doc.page_content for doc in retrieved_docs)
    
    def process_query(self, question, video_id, history=None):
        """Process user query using RAG, with chat history"""
        # Ensure video is processed
        if video_id not in self.vector_stores:
            result = self.process_video(video_id)
            if result["status"] == "error":
                return "Sorry, I couldn't access the transcript for this video. Please make sure the video has captions available."
        
        vector_store = self.vector_stores[video_id]
        retriever = vector_store.as_retriever(
            search_type="similarity", 
            search_kwargs={"k": 4}
        )
        
        # Build conversation context from history
        conversation = ""
        if history:
            for msg in history:
                sender = "User" if msg["sender"] == "user" else "Assistant"
                conversation += f"{sender}: {msg['message']}\n"
        conversation += f"Human: {question}"
        
        # Create RAG chain
        chain = (
            RunnableParallel({
                'context': retriever | RunnableLambda(self.format_docs),
                'question': RunnablePassthrough()
            })
            | PromptTemplate(
                template=(
                    f"""You are a helpful AI assistant for YouTube videos. "
                    "Answer ONLY from the provided transcript context. "
                    "If the context is insufficient, say you don't know and suggest they ask a more specific question. "
                    "Be conversational and helpful.\n\n"
                    "Context from video transcript:\n{{context}}\n\n"
                    f"Conversation so far:\n{conversation}\n\n"
                    "Assistant:"""
                ),
                input_variables=['context', 'question']
            )
            | self.llm
            | StrOutputParser()
        )
        
        try:
            response = chain.invoke(question)
            print(f"[Backend Response] {response}")
            return response
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return "Sorry, there was an error processing your question. Please try again."