/**
 * React-Komponenten Beispiele für Firebase
 * Copy-Paste in deine App
 */

import React, { useState, useEffect } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  createPost,
  onPostsUpdated,
  formatTimestamp,
  isEmail,
  validatePassword
} from '../services/firebaseService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ============================================
// LOGIN FORM COMPONENT
// ============================================

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validierung
      if (!isEmail(email)) {
        throw new Error('Ungültige Email-Adresse');
      }
      if (!validatePassword(password)) {
        throw new Error('Passwort muss mindestens 6 Zeichen sein');
      }

      await loginUser(email, password);
      console.log('✅ Login erfolgreich');
      // Navigation zur Dashboard würde hier erfolgen
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="deine@email.de"
        />
      </div>

      <div>
        <label>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Wird angemeldet...' : 'Anmelden'}
      </button>
    </form>
  );
}

// ============================================
// REGISTER FORM COMPONENT
// ============================================

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validierung
      if (!name || !email || !password) {
        throw new Error('Alle Felder sind erforderlich');
      }
      if (!isEmail(email)) {
        throw new Error('Ungültige Email-Adresse');
      }
      if (!validatePassword(password)) {
        throw new Error('Passwort muss mindestens 6 Zeichen sein');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwörter stimmen nicht überein');
      }

      await registerUser(email, password, name);
      setSuccess(true);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      console.log('✅ Registrierung erfolgreich');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        ✅ Registrierung erfolgreich! Du kannst dich nun anmelden.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          placeholder="Dein Name"
        />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="deine@email.de"
        />
      </div>

      <div>
        <label>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••"
        />
      </div>

      <div>
        <label>Passwort wiederholen</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Wird registriert...' : 'Registrieren'}
      </button>
    </form>
  );
}

// ============================================
// POSTS FEED COMPONENT
// ============================================

export function PostsFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Posts Listener
  useEffect(() => {
    const unsubscribe = onPostsUpdated((updatedPosts) => {
      setPosts(updatedPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    setError(null);
    setIsCreating(true);

    try {
      if (!newPostContent.trim()) {
        throw new Error('Post-Inhalt darf nicht leer sein');
      }

      await createPost(newPostContent, currentUserId);
      setNewPostContent('');
      console.log('✅ Post erstellt');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="loading">Posts werden geladen...</div>;
  }

  return (
    <div className="posts-feed">
      <h2>News Feed</h2>

      {currentUserId && (
        <form onSubmit={handleCreatePost} className="create-post">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Was möchtest du teilen?"
            disabled={isCreating}
            rows={3}
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Wird veröffentlicht...' : 'Veröffentlichen'}
          </button>
        </form>
      )}

      <div className="posts-list">
        {posts.length === 0 ? (
          <p>Noch keine Posts vorhanden</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <strong>{post.author}</strong>
                <span className="post-date">
                  {formatTimestamp(post.createdAt)}
                </span>
              </div>
              <p className="post-content">{post.content}</p>
              <div className="post-footer">
                <span>👍 {post.likes} Likes</span>
                <span>💬 {post.comments || 0} Kommentare</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// USER PROFILE COMPONENT
// ============================================

export function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      console.log('✅ Abgemeldet');
    } catch (error: any) {
      console.error('❌ Fehler:', error.message);
    }
  };

  if (loading) {
    return <div>Wird geladen...</div>;
  }

  if (!user) {
    return <div>Nicht angemeldet</div>;
  }

  return (
    <div className="user-profile">
      <h2>Mein Profil</h2>
      {user.photoURL && (
        <img src={user.photoURL} alt="Profil" className="profile-avatar" />
      )}
      <p><strong>Name:</strong> {user.displayName || 'Unbekannt'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button onClick={handleLogout}>Abmelden</button>
    </div>
  );
}

// ============================================
// COMPLETE APP EXAMPLE
// ============================================

export function FirebaseAppExample() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="auth-container">
        {authMode === 'login' ? (
          <>
            <LoginForm />
            <p>
              Noch kein Konto?{' '}
              <button onClick={() => setAuthMode('register')}>
                Registrieren
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm />
            <p>
              Bereits registriert?{' '}
              <button onClick={() => setAuthMode('login')}>
                Anmelden
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>HorizontOS</h1>
        <UserProfile />
      </header>
      <main>
        <PostsFeed />
      </main>
    </div>
  );
}
