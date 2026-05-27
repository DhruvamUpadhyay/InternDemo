import { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import { LogOut, Cloud } from 'lucide-react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert(error.message);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: 'var(--primary)' }}>
        <Cloud size={48} className="animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', background: '#f8f9fa' }}>
        <div className="panel" style={{ padding: '3rem', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Cloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 500 }}>Intern Print</h2>
            <p style={{ color: 'var(--text-muted)' }}>Secure Cloud Kiosk</p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" />
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <button onClick={handleGoogleAuth} className="btn btn-outline" style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center' }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            Continue with Google
          </button>

          <p style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <Cloud size={32} color="var(--primary)" />
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-dark)' }}>Intern Print</h1>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="storage-container">
            <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Storage Used</strong>
            </div>
            <div className="storage-bar-bg">
              <div className="storage-bar-fill" style={{ width: `${Math.min((totalSize / (15 * 1024 * 1024 * 1024)) * 100, 100)}%` }}></div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {(totalSize / (1024 * 1024)).toFixed(2)} MB / 15 GB
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ padding: '0 12px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Logged in as:<br/><strong>{user.email}</strong>
            </div>
            <button onClick={() => signOut(auth)} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Dashboard user={user} setTotalSize={setTotalSize} />
        </div>
      </main>
    </div>
  );
}

export default App;
