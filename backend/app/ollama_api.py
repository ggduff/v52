import os
import requests
import logging
import json
import os
import requests
import logging
import json
class OllamaAPI:
    def __init__(self):
        self.base_url = "http://laxgpu.thinkhuge.net:11434/api"
        self.model = ""  # Initialize model attribute

    def set_model(self, value):
        """Sets the value of the model attribute based on the form input."""
        if value == "standard":
            self.model = "mistral"
        elif value == "enhanced":
            self.model = "mixtral"
        else:
            self.model = "mistral"

    def interact(self, prompt, stream=False):
        """Interacts with the Ollama model and returns responses."""
        url = f"{self.base_url}/chat"
        data = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "stream": stream
        }
        try:
            logging.debug(f"Sending request to Ollama: {data}")
            response = requests.post(url, json=data)
            response.raise_for_status()
            response_json = response.json()
            logging.debug(f"Received response from Ollama: {response_json}")
            return response_json
        except requests.RequestException as e:
            logging.error(f"Error interacting with Ollama: {e}")
            if e.response:
                logging.error(f"Response status code: {e.response.status_code}")
                logging.error(f"Response text: {e.response.text}")
            return {'error': str(e), 'status_code': e.response.status_code if e.response else 'N/A', 'response': e.response.text if e.response else 'No response'}