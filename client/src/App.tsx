import { useState } from 'react';

// A minimal, reusable component for the login/register forms
const AuthForm = ({ isRegister }: { isRegister: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isRegister ? '/register' : '/login';
    const url = `http://localhost:8080${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Failed to connect to server.');
      console.error('Fetch error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

// Main App component to toggle between login and register views
function App() {
  const [isRegisterView, setIsRegisterView] = useState(false);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header>
        <h1>Go + React Auth</h1>
        <button onClick={() => setIsRegisterView(!isRegisterView)}>
          Switch to {isRegisterView ? 'Login' : 'Register'}
        </button>
      </header>
      <main style={{ marginTop: '2rem' }}>
        {isRegisterView ? <AuthForm isRegister={true} /> : <AuthForm isRegister={false} />}
      </main>
    </div>
  );
}

export default App;
