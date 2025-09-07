from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_system import RAGSystem
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize RAG system
rag_system = RAGSystem()

@app.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "active", "message": "Backend is running"})

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        video_id = data.get('video_id')
        history = data.get('history', [])
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        if not video_id:
            return jsonify({"error": "Video ID is required"}), 400
        
        # Process the message with RAG system, passing history
        response = rag_system.process_query(message, video_id, history)
        
        return jsonify({"response": response})
    
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/process-video', methods=['POST'])
def process_video():
    try:
        data = request.json
        video_id = data.get('video_id')
        
        if not video_id:
            return jsonify({"error": "Video ID is required"}), 400
        
        # Process video transcript
        result = rag_system.process_video(video_id)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
@app.route('/', methods=['GET'])
def home():
    return "Welcome to the YouTube AI Chatbot Backend!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)