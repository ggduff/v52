from flask import Blueprint, request, jsonify
from .ollama_api import OllamaAPI

chat_blueprint = Blueprint('routes', __name__)

@chat_blueprint.route('/chat', methods=['POST'])
def chat():
    data = request.json
    model_choice = data.get('model', 'standard')  # Default to 'standard' if not provided
    prompt = data.get('prompt')
    document_url = data.get('document_url')  # Get the document URL from the request data

    ollama_api = OllamaAPI(base_url="http://laxgpu.thinkhuge.net:11434", model="mistral", temperature=0.7, top_p=1.0)

    if document_url:
        # Load the document from the provided URL
        document = ollama_api.load_document(document_url)
        # Interact with the Ollama model using the Retrieval QA chain
        response = ollama_api.interact(prompt, document)
    else:
        # Interact with the Ollama model without a document
        response = ollama_api.interact(prompt)

    if response:
        return jsonify({"response": response}), 200
    else:
        return jsonify({'error': 'Failed to get response from Ollama API. Please check the Ollama server logs for more details.'}), 500