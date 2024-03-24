from app import create_app
from dotenv import load_dotenv
import os
load_dotenv()  # This method loads variables from .flaskenv
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('FLASK_RUN_PORT')), debug=str(os.environ.get('FLASK_DEBUG')))