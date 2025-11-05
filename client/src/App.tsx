import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

// === AuthForm Component ===
const AuthForm = ({ isRegister }: { isRegister: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isRegister ? '/signup' : '/login';
    const url = `http://localhost:8080${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save tokens and username
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        navigate('/dashboard');
      }

      setMessage(data.message || (isRegister ? 'Registered!' : 'Logged in!'));
    } catch (error) {
      console.error(error);
      setMessage('Failed to connect to server.');
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
      {message && (
        <p style={{ marginTop: '1rem', color: message.toLowerCase().includes('success') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
};

// === Dashboard Component ===
const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      navigate('/');
      return;
    }

    try {
      let response = await fetch('http://localhost:8080/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // If access token expired, try refreshing
      if (response.status === 401) {
        const refreshResponse = await fetch('http://localhost:8080/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access_token);

          // Retry profile request
          response = await fetch('http://localhost:8080/profile', {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
        } else {
          // Refresh failed, log out
          handleLogout();
          return;
        }
      }

      const data = await response.json();
      setUsername(data.message.replace('Welcome ', ''));
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch profile.');
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'sans-serif' }}>
      <h1>🎉 You are now logged in!</h1>
      <p>
        Welcome, <strong>{username}</strong> 👋
      </p>
      <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
        Log Out
      </button>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
};

// === Home Page Component ===
const Home = () => {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('username')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header>
        <h1>Go + React Auth</h1>
        <button onClick={() => setIsRegisterView(!isRegisterView)}>
          Switch to {isRegisterView ? 'Login' : 'Register'}
        </button>
      </header>
      <main style={{ marginTop: '2rem' }}>
        <AuthForm isRegister={isRegisterView} />
      </main>
    </div>
  );
};

// === Main App Component ===
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
