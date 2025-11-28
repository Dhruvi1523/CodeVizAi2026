import React, { useState } from 'react';
import axios from 'axios';
import './j1.css';

const TracerPanel = () => {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('python'); // default language
  const [traceOutput, setTraceOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to call your /trace endpoint
  const handleTrace = async () => {
    setLoading(true);
    setError(null);
    setTraceOutput(null);

    try {
      const response = await axios.post('https://codevizai2026.onrender.com/trace', {
        code,
        language: lang,
      });
      setTraceOutput(response.data.trace);
    } catch (err) {
      setError('Failed to trace code. Check your code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracer-panel">
      <h2>Code Tracer</h2>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="lang-select"
      >
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
        <option value="c">C</option>
        <option value="java">Java</option>
      </select>

      <textarea
        rows="10"
        cols="50"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code here..."
        className="code-input"
      />

      <button
        onClick={handleTrace}
        disabled={loading}
        className="trace-button"
      >
        {loading ? 'Tracing...' : 'Trace Code'}
      </button>

      {error && <p className="error">{error}</p>}

      {traceOutput && (
        <div className="trace-output">
          <h3>Trace Results</h3>
          <pre className="json-output">
            {JSON.stringify(traceOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TracerPanel;
