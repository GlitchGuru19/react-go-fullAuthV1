import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

// === AuthForm Component ===
// This component handles both registration and login forms
const AuthForm = ({ isRegister }: { isRegister: boolean }) => {
  // Local state for form fields and messages
  const [username, setUsername] = useState(''); // Stores username input
  const [password, setPassword] = useState(''); // Stores password input
  const [message, setMessage] = useState('');   // Stores success/error messages
  const navigate = useNavigate();               // Hook from React Router to programmatically navigate

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submit
    setMessage('');     // Reset previous messages

    // Determine backend endpoint based on whether it's a registration or login form
    const endpoint = isRegister ? '/register' : '/login';
    const url = `http://localhost:8080${endpoint}`; // Backend URL

    try {
      // Send POST request to backend with username and password
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // JSON request
        body: JSON.stringify({ username, password }),    // Convert data to JSON string
      });

      // Parse JSON response from backend
      const data = await response.json();

      // If login was successful and this is not the register form
      if (response.ok && !isRegister) {
        localStorage.setItem('username', username); // Save username in localStorage for persistence
        navigate('/dashboard');                     // Navigate to dashboard page
      }

      // Set the message returned from backend (success or error)
      setMessage(data.message);
    } catch (error) {
      // Handle network errors or fetch failures
      setMessage('Failed to connect to server.');
      console.error('Fetch error:', error);
    }
  };

  // Render form UI
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '400px',
        margin: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form
        onSubmit={handleSubmit} // Attach submit handler
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Username input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Update state on input change
          required
        />
        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update state on input change
          required
        />
        {/* Submit button */}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      {/* Display message (success or error) */}
      {message && (
        <p
          style={{
            marginTop: '1rem',
            color: message.includes('successfully') ? 'green' : 'red', // Green for success, red for error
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// === Dashboard Component ===
// This component is shown after successful login
const Dashboard = () => {
  const navigate = useNavigate();              // Used to redirect users
  const [username, setUsername] = useState<string | null>(null); // Stores the logged-in username

  // useEffect runs after component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('username'); // Check if user is stored in localStorage
    if (storedUser) {
      setUsername(storedUser); // Set username state if found
    } else {
      navigate('/');           // If no user found, redirect to login page
    }
  }, [navigate]); // Dependency array ensures useEffect runs once after mount

  // Function to log out user
  const handleLogout = () => {
    localStorage.removeItem('username'); // Remove username from localStorage
    navigate('/');                        // Redirect to login page
  };

  // Render dashboard UI
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>🎉 You are now logged in!</h1>
      <p>
        Welcome, <strong>{username}</strong> 👋
      </p>
      <button onClick={handleLogout} style={{ marginTop: '1rem' }}>
        Log Out
      </button>
    </div>
  );
};

// === Home Page Component ===
// Displays the login/register form with toggle
const Home = () => {
  const [isRegisterView, setIsRegisterView] = useState(false); // Toggle state between login and register
  const navigate = useNavigate();                               // Used for redirecting if already logged in

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      navigate('/dashboard'); // Automatically redirect logged-in user to dashboard
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header>
        <h1>Go + React Auth</h1>
        {/* Toggle button between login and register */}
        <button onClick={() => setIsRegisterView(!isRegisterView)}>
          Switch to {isRegisterView ? 'Login' : 'Register'}
        </button>
      </header>
      <main style={{ marginTop: '2rem' }}>
        {isRegisterView ? (
          <AuthForm isRegister={true} />
        ) : (
          <AuthForm isRegister={false} />
        )}
      </main>
    </div>
  );
};

// === Main App Component ===
function App() {
  return (
    // Router wraps all routes to enable navigation
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />            {/* Home page: login/register */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard page */}
      </Routes>
    </Router>
  );
}

export default App;
