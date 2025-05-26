# Unified_Platform

## unified_backend

#### Code class (Pydantic)
Used to validate incoming JSON payloads with a code field for safe execution.

#### /db/query
Handles SQL queries. 
Executes valid SQL.
Returns SELECT results as JSON.
Returns success/failure messages for INSERT, UPDATE, DELETE.

####  /python/run
Allows execution of submitted Python code:
Uses tempfile.NamedTemporaryFile to safely write and run Python code.
Captures stdout and stderr.
Returns combined result.

Note: input() won't work in this version; needs WebSocket for full REPL.

#### /prompt/test
Mimics or connects to an LLM API.
Currently just echoes the prompt.
Can be connected to OpenAI or HuggingFace in future.

#### /scripts/list, /scripts/get, /scripts/save
In-memory management of small code snippets or text prompts.
Simulates script loading/saving
Not persistent — use file system or database for long-term storage.

#### Database Initialization
On server start, a SQLite database (demo.db) is initialized with:
A table demo(id INTEGER, name TEXT)

### To run the backend :  
Activate the virtual environment  
install the dependencies(pip install flask flask-cors flask-pydantic pydantic)    
python run app.py  

## Unified_frontend 

### To run the frontend 

cd unified_app   
npm install   
npm start



