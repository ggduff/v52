# HugeThink
## Powered by v52

https://github.com/ggduff/v52

## Initial application structure

    v52/
    │
    ├── backend/                 
    │   ├── app/                 
    │   │   ├── __init__.py      
    │   │   ├── models.py        
    │   │   ├── routes.py        
    │   │   └── ollama_api.py    
    │   ├── uploads/             # Directory to store uploaded files
    │   ├── files/               # Directory to store processed files
    │   ├── venv/                
    │   ├── .flaskenv            
    │   ├── requirements.txt     
    │   ├── run.py               
    │   └── templates/           
    │       └── login.html       
    │
    ├── frontend/                
    │   ├── public/              
    │   ├── src/                 
    │   │   ├── App.js           
    │   │   ├── Chat.js          
    │   │   ├── HomePage.js      
    │   │   ├── index.css        
    │   │   └── index.js         
    │   ├── .env                 
    │   ├── package.json         
    │   └── tailwind.config.js   
    │
    └── .gitignore

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

## TODO Need to fix the issue with .flaskenv env vars not working in run.py
    export FLASK_RUN_PORT=2152
    export FLASK_DEBUG=True
    export FLASK_ENV=development
    export FLASK_APP=run.py

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
