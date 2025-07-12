import { useState } from 'react'
import axios from 'axios'

function App() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')

  const handleSend = async () => {
    try {
      const res = await axios.post('http://localhost:8000/echo', { text: input })
      setResponse(res.data.echo)
    } catch (err) {
      console.error(err)
      setResponse('Error reaching backend')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>React + FastAPI Echo</h1>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter message"
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Send</button>
        <p style={styles.response}>
          Response from backend: <strong>{response}</strong>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    backgroundColor: '#1f1f1f',
    padding: 30,
    borderRadius: 12,
    width: 320,
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7)',
  },
  title: {
    marginBottom: 25,
    color: '#61dafb',
    fontWeight: '700',
    fontSize: '1.8rem',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 20,
    borderRadius: 6,
    border: '1.5px solid #333',
    backgroundColor: '#2a2a2a',
    color: '#eee',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#61dafb',
    border: 'none',
    borderRadius: 6,
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  response: {
    marginTop: 25,
    fontSize: 16,
    color: '#ccc',
    minHeight: 24,
  },
}

export default App
