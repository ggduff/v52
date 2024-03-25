from flask import Blueprint, request, jsonify, send_from_directory, redirect, url_for, session, current_app as app, render_template
import secrets
from authlib.integrations.flask_client import OAuth
import os
from .ollama_api import OllamaAPI

UPLOAD_FOLDER = '/srv/duff-dev/v52/backend/uploads'
FILES_FOLDER = '/srv/duff-dev/v52/backend/files'

chat_blueprint = Blueprint('routes', __name__, static_folder='../frontend/build', static_url_path='/')

@chat_blueprint.record_once
def on_register(state):
    chat_blueprint.oauth = OAuth(state.app)
    chat_blueprint.oauth.register(
        name='google',
        client_id=state.app.config['GOOGLE_CLIENT_ID'],
        client_secret=state.app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url=state.app.config['GOOGLE_DISCOVERY_URL'],
        client_kwargs={'scope': 'openid email profile'},
    )

@chat_blueprint.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@chat_blueprint.route('/login')
def login():
    if 'user' in session:
        # User is already logged in, redirect to the home page.
        return redirect('/')
    # User is not logged in, render the login page.
    return render_template('login.html')

@chat_blueprint.route('/trigger_google_auth')
def trigger_google_auth():
    oauth = chat_blueprint.oauth  # Retrieve the oauth object from the blueprint
    google = oauth.create_client('google')
    nonce = secrets.token_urlsafe()
    session['nonce'] = nonce
    redirect_uri = url_for('.authorize', _external=True)
    return google.authorize_redirect(redirect_uri, nonce=nonce)

@chat_blueprint.route('/authorize')
def authorize():
    google = chat_blueprint.oauth.create_client('google')
    token = google.authorize_access_token()
    nonce = session.pop('nonce', None)
    try:
        userinfo = google.parse_id_token(token, nonce=nonce)
        session['user'] = userinfo
        return redirect('/')
    except Exception as e:
        return 'Authentication failed.', 400

@chat_blueprint.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/login')

@chat_blueprint.route('/check_auth')
def check_auth():
    """Check if the user is logged in."""
    return jsonify({'authenticated': 'user' in session})

@chat_blueprint.route('/chat', methods=['POST'])
def chat():
    data = request.json
    model_choice = data.get('model', 'standard')
    prompt = data.get('prompt')
    document_url = data.get('document_url')
    ollama_api = OllamaAPI(base_url="http://laxgpu.thinkhuge.net:11434", model="mistral", temperature=0.7, top_p=1.0)
    if document_url:
        document = ollama_api.load_document(document_url)
        response = ollama_api.interact(prompt, document)
    else:
        response = ollama_api.interact(prompt)
    if response:
        return jsonify({"response": response}), 200
    else:
        return jsonify({'error': 'Failed to get response from Ollama API.'}), 500

@chat_blueprint.route('/upload', methods=['POST'])
def upload_files():
    uploaded_files = request.files.getlist('files')  # Get the list of uploaded files from the request
    for file in uploaded_files:
        if file and allowed_file(file.filename):
            filename = file.filename
            file.save(os.path.join(UPLOAD_FOLDER, filename))
    return jsonify({'message': 'Files uploaded successfully'}), 200

@chat_blueprint.route('/files', methods=['GET'])
def get_files():
    files = os.listdir(UPLOAD_FOLDER)  # Change this to UPLOAD_FOLDER instead of FILES_FOLDER
    return jsonify({'files': files}), 200

@chat_blueprint.route('/files/<path:filename>', methods=['DELETE'])
def delete_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'message': 'File deleted successfully'}), 200
    else:
        return jsonify({'error': 'File not found'}), 404
    
@chat_blueprint.route('/', defaults={'path': ''})
@chat_blueprint.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(chat_blueprint.static_folder, path)):
        return send_from_directory(chat_blueprint.static_folder, path)
    elif 'user' not in session:
        return send_from_directory(chat_blueprint.static_folder, path)
    # return redirect(url_for('.login'))
    return send_from_directory(chat_blueprint.static_folder, 'index.html')

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'txt', 'json', 'csv', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS