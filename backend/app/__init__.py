from flask import Flask
from flask_cors import CORS
from .routes import bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes and origins
    app.register_blueprint(bp)
    return app