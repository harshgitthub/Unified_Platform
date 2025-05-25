from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import subprocess
import tempfile
from pydantic import BaseModel, ValidationError
from flask_pydantic import validate
import openai  # You can mock if no API key


app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

class Code(BaseModel):
    code: str

# -- Database (SQLite demo) setup --
def get_db_connection():
    conn = sqlite3.connect('demo.db', timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/db/query', methods=['POST'])
def query_db():
    data = request.json
    query = data.get('query', '').strip()
    if not query:
        return jsonify({"error": "No query provided"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.execute(query)

        if query.lower().startswith('select'):
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in rows]
            return jsonify({"results": results})
        else:
            conn.commit()
            affected = cursor.rowcount
            return jsonify({"message": "Query executed successfully", "rows_affected": affected})

    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 400

    finally:
        if conn:
            conn.close()

# -- Reference programs (simple in-memory list) --
reference_scripts = {
    "hello.py": 'print("Hello from reference script!")',
    "example_prompt.txt": 'Explain AI in simple terms.'
}

@app.route('/scripts/list', methods=['GET'])
def list_scripts():
    return jsonify({"scripts": list(reference_scripts.keys())})

@app.route('/scripts/get', methods=['POST'])
def get_script():
    data = request.json
    name = data.get('name')
    content = reference_scripts.get(name, "")
    return jsonify({"content": content})

@app.route('/scripts/save', methods=['POST'])
def save_script():
    data = request.json
    name = data.get('name')
    content = data.get('content')
    reference_scripts[name] = content
    return jsonify({"status": "saved"})

# -- Python code execution --
@app.route('/python/run', methods=['POST'])
def execute_code():
    try:
        json_data = request.get_json()
        payload = Code(**json_data)  # Validate input using Pydantic

        # Write code to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".py", mode='w+', delete=False) as f:
            f.write(payload.code)
            f.flush()
            result = subprocess.run(
                ["python", f.name],
                capture_output=True,
                text=True,
                timeout=5
            )

        return jsonify({"output": result.stdout + result.stderr})
    
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# -- Prompt testing (mock example) --
@app.route('/prompt/test', methods=['POST'])
def test_prompt():
    data = request.json
    prompt = data.get('prompt', '')

    # Mocked response (replace with OpenAI API call if you want)
    response = f"Echo: {prompt}"

    return jsonify({"response": response})

if __name__ == '__main__':
    # Initialize demo SQLite DB table if needed
    conn = get_db_connection()
    conn.execute('CREATE TABLE IF NOT EXISTS demo(id INTEGER PRIMARY KEY, name TEXT)')
    conn.execute("INSERT OR IGNORE INTO demo(id, name) VALUES (1, 'Alice')")
    conn.commit()
    conn.close()

    app.run(port=5000, debug=True)
