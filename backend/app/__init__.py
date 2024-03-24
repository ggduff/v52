# app/__init__.py
from flask import Flask
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os

def create_app():
    app = Flask(__name__, template_folder='../templates')
    CORS(app)
    app.config.from_mapping(
        SECRET_KEY=os.getenv('SECRET_KEY'),
        GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID'),
        GOOGLE_CLIENT_SECRET=os.getenv('GOOGLE_CLIENT_SECRET'),
        GOOGLE_DISCOVERY_URL="https://accounts.google.com/.well-known/openid-configuration",
    )

    # Initialize OAuth with app
    oauth = OAuth(app)

    # Import and register the blueprint
    from .routes import chat_blueprint
    app.register_blueprint(chat_blueprint, oauth=oauth)

    return app