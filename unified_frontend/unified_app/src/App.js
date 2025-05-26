import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function App() {
  const [activeTab, setActiveTab] = useState('db');
  const [dbQuery, setDbQuery] = useState('SELECT * FROM demo;');
  const [dbResults, setDbResults] = useState(null);
  const [dbError, setDbError] = useState(null);

  const [scriptsList, setScriptsList] = useState([]);
  const [selectedScript, setSelectedScript] = useState('');
  const [scriptContent, setScriptContent] = useState('');

  const [promptInput, setPromptInput] = useState('');
  const [promptResponse, setPromptResponse] = useState('');

  const [pythonCode, setPythonCode] = useState('print("Hello from Python IDE")');
  const [pythonOutput, setPythonOutput] = useState('');
  const [pythonError, setPythonError] = useState(null);

  const backendUrl = 'http://localhost:5000';

  // Load scripts list
  useEffect(() => {
    axios.get(`${backendUrl}/scripts/list`).then(res => {
      setScriptsList(res.data.scripts);
      if (res.data.scripts.length > 0) {
        setSelectedScript(res.data.scripts[0]);
      }
    });
  }, []);

  // Load selected script content
  useEffect(() => {
    if (selectedScript) {
      axios.post(`${backendUrl}/scripts/get`, { name: selectedScript })
        .then(res => setScriptContent(res.data.content));
    }
  }, [selectedScript]);

  // Run DB Query
  const runDbQuery = () => {
    setDbError(null);
    setDbResults(null);
    axios.post(`${backendUrl}/db/query`, { query: dbQuery })
      .then(res => setDbResults(res.data.results))
      .catch(err => setDbError(err.response?.data?.error || err.message));
  };

  // Save reference script
  const saveScript = () => {
    axios.post(`${backendUrl}/scripts/save`, { name: selectedScript, content: scriptContent });
    alert('Script saved!');
  };

  // Test prompt
  const testPrompt = () => {
    axios.post(`${backendUrl}/prompt/test`, { prompt: promptInput })
      .then(res => setPromptResponse(res.data.response));
  };

  // Run Python code
  const runPythonCode = () => {
    setPythonError(null);
    setPythonOutput('Running...');
    axios.post(`${backendUrl}/python/run`, { code: pythonCode })
      .then(res => {
        if (res.data.error) {
          setPythonError(res.data.error);
          setPythonOutput('');
        } else {
          setPythonOutput(res.data.output);
        }
      }).catch(() => {
        setPythonError('Execution failed');
        setPythonOutput('');
      });
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: 'auto' }}>
      <h1>Unified IDE Demo</h1>
      <div>
        <button onClick={() => setActiveTab('db')}>Database Query</button>
        <button onClick={() => setActiveTab('scripts')}>Reference Scripts</button>
        <button onClick={() => setActiveTab('prompt')}>Prompt Engineering</button>
        <button onClick={() => setActiveTab('python')}>Python IDE</button>
      </div>

      {activeTab === 'db' && (
        <div style={{ marginTop: 20 }}>
          <h2>Database Query</h2>
          <textarea
            style={{ width: '100%', height: 80 }}
            value={dbQuery}
            onChange={e => setDbQuery(e.target.value)}
          />
          <button onClick={runDbQuery}>Run Query</button>
          {dbError && <p style={{ color: 'red' }}>{dbError}</p>}
          {dbResults && (
            <table border="1" cellPadding="5" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  {Object.keys(dbResults[0] || {}).map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dbResults.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'scripts' && (
        <div style={{ marginTop: 20 }}>
          <h2>Reference Scripts</h2>
          <select onChange={e => setSelectedScript(e.target.value)} value={selectedScript}>
            {scriptsList.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <Editor
            height="200px"
            language={selectedScript.endsWith('.py') ? "python" : "plaintext"}
            value={scriptContent}
            onChange={setScriptContent}
          />
          <button onClick={saveScript} style={{ marginTop: 10 }}>Save Script</button>
        </div>
  )}

  {activeTab === 'prompt' && (
    <div style={{ marginTop: 20 }}>
      <h2>Prompt Engineering</h2>
      <textarea
        rows="4"
        style={{ width: '100%' }}
        value={promptInput}
        onChange={e => setPromptInput(e.target.value)}
      />
      <button onClick={testPrompt}>Test Prompt</button>
      <pre style={{ backgroundColor: '#eee', padding: 10 }}>{promptResponse}</pre>
    </div>
  )}

  {activeTab === 'python' && (
    <div style={{ marginTop: 20 }}>
      <h2>Python IDE</h2>
      <Editor
        height="200px"
        language="python"
        value={pythonCode}
        onChange={setPythonCode}
      />
      <button onClick={runPythonCode} style={{ marginTop: 10 }}>Run Code</button>
      {pythonError && <p style={{ color: 'red' }}>{pythonError}</p>}
      {pythonOutput && <pre style={{ backgroundColor: '#eee', padding: 10 }}>{pythonOutput}</pre>}
    </div>
  )}
</div>
);
}

export default App;