import React, { useState } from 'react';
import axios from 'axios';
import './j1.css'; // Optional CSS for styling

const TracerPanel = () => {
  const [code, setCode] = useState(''); // Stores user-entered Python code
  const [traceOutput, setTraceOutput] = useState(null); // Stores trace JSON from backend
  const [loading, setLoading] = useState(false); // Tracks API call status
  const [error, setError] = useState(null); // Tracks errors

  // Function to call your /trace endpoint
  const handleTrace = async () => {
    setLoading(true);
    setError(null);
    setTraceOutput(null); // Clear previous output
    try {
      const response = await axios.post('http://localhost:8000/trace', { code });
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
      <textarea
        rows="10"
        cols="50"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter Python code to trace..."
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

    {/* Show JSON output */}
    <pre className="json-output">
      {JSON.stringify(traceOutput, null, 2)}
    </pre>
  </div>
)}
    </div>
  );
};

export default TracerPanel;  