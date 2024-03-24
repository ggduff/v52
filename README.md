# HugeThink
## Powered by v52

https://github.com/ggduff/v52

## Initial application structure

    v52/
    │
    ├── backend/                 # All backend-related files
    │   ├── app/                 # Flask application
    │   │   ├── __init__.py      # Initializes Flask app
    │   │   ├── models.py        # Defines data models
    │   │   └── routes.py        # API routes
    │   ├── venv/                # Python virtual environment
    │   ├── .flaskenv            # Flask environment variables
    │   ├── requirements.txt     # Python dependencies
    │   ├── run.py               # Entry point for Flask application
    │   └── templates/           # Flask HTML templates (login page)
    │
    ├── frontend/                # All frontend-related files
    │   ├── public/              # Public assets
    │   ├── src/                 # React application source
    │   ├── .env                 # React environment variables
    │   ├── package.json         # npm dependencies
    │   └── tailwind.config.js   # Tailwind CSS configuration
    │
    └── .gitignore               # Specifies intentionally untracked files

We access our app on the web at (ex: http://v51.thinkhuge.net:2153)

Flask runs on the backend at (ex: http://localhost:2152)

###############################################################################
## Set up project directory
	mkdir -p /srv/user-dev/v52
    chown -R username:staff /srv/user-dev/
## Clone Your GitHub Repository
	cd /srv/user-dev/v52
	git clone https://github.com/ggduff/v52.git .

## Files to be added:
    vi frontend/.env
    REACT_APP_CHAT_API_URL=http://v51.thinkhuge.net:2152

    vi backend/.flaskenv
    FLASK_APP=run.py
    FLASK_ENV=development
    FLASK_RUN_PORT=2152

## Set up Backend with Flask
	python3 -m venv venv
	source venv/bin/activate
    cd backend

    #Then, run:
	pip install -r requirements.txt


## Replace port in run.py
    vi v52/backend/run.py
    #Replace port below
	flask run --host=0.0.0.0 --port=(####)


## Upgrade Node.js to latest version (v20.x as of 3/24/2024)
    https://deb.nodesource.com/

    #Remove conflicting packages if necessary
    sudo apt-get remove libnode-dev
    sudo apt-get clean
    sudo apt-get update
    sudo apt-get install -y nodejs

    node -v
    #check version (v20.11.1)

    #Install dependencies from frontend/package.json
    npm install
