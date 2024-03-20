from flask import Blueprint, request, jsonify
from .ollama_api import OllamaAPI

bp = Blueprint('routes', __name__)

@bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    model_choice = data.get('model', 'standard')  # Default to 'standard' if not provided
    prompt = data.get('prompt')

    ollama_api = OllamaAPI()
    ollama_api.set_model(model_choice)  # Adjust the model based on input
    response = ollama_api.interact(prompt)  # Interact with the Ollama API

    if response:
        return jsonify(response), 200
    else:
        return jsonify({'error': 'Failed to get response from Ollama API'}), 500