
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, Heart, MessageCircle, FileUp, 
  CheckCircle2, ChevronRight, Award, Sparkles,
  Calendar, Rss, Stethoscope, ClipboardList, Gamepad2, Trophy, Gift, BarChart3,
  UserPlus, Mail, Lock, LogIn, LogOut, AlertCircle, ArrowUpRight, Globe, ShieldAlert,
  Users, Trash2, Edit3, CheckCircle, XCircle, FileText, User as UserIcon, Loader2,
  ShieldCheck, Shield, Clock, MapPin, Camera, Search, ChevronLeft
} from 'lucide-react';

// Firebase Imports
import { 
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  where,
  increment,
  Timestamp,
  limit,
  or,
  and
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { auth, db, storage, functions } from './firebase';

import Layout from './components/Layout';
import Logo from './components/Logo';
import { AppView, User, Post, BoardNote, Survey, Giveaway, Message, SickLeaveEntry, RosterEntry } from './types';
import { getAiResponse } from './services/geminiService';

// Individual Components for Views
import Snake from './components/Games/Snake';
import Memory from './components/Games/Memory';
import WhackAMole from './components/Games/WhackAMole';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [currentGame, setCurrentGame] = useState<'none' | 'snake' | 'memory' | 'whack'>('none');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Firebase Data States
  const [feed, setFeed] = useState<Post[]>([]);
  const [rosterData, setRosterData] = useState<RosterEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [boardNotes, setBoardNotes] = useState<BoardNote[]>([]);
  const [sickLeaves, setSickLeaves] = useState<SickLeaveEntry[]>([]);
  
  // Chat Specific States
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  
  const [isProcessingRole, setIsProcessingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth Form State
  const [regName, setRegName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const isAdminClaim = tokenResult.claims.role === 'admin' || tokenResult.claims.admin === true;

        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({ ...userData, isAdmin: isAdminClaim });
        } else {
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Mitarbeiter',
            email: firebaseUser.email || '',
            role: 'Mitarbeiter',
            avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
            score: 0,
            isAdmin: isAdminClaim
          };
          setUser(fallbackUser);
          await setDoc(doc(db, "users", firebaseUser.uid), fallbackUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Realtime Firestore Listeners
  useEffect(() => {
    if (!user) return;

    // News Feed
    const qFeed = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsubFeed = onSnapshot(qFeed, (snap) => setFeed(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))));

    // Users
    const qUsers = query(collection(db, "users"), orderBy("score", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snap) => setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User))));

    // Dienstplan
    const qRoster = query(collection(db, "roster"));
    const unsubRoster = onSnapshot(qRoster, (snap) => setRosterData(snap.docs.map(d => ({ id: d.id, ...d.data() } as RosterEntry))));

    // Pinnwand
    const qBoard = query(collection(db, "board"), orderBy("createdAt", "desc"));
    const unsubBoard = onSnapshot(qBoard, (snap) => setBoardNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as BoardNote))));

    // Krankmeldungen
    const qSick = user.isAdmin 
      ? query(collection(db, "sickleaves"), orderBy("createdAt", "desc"))
      : query(collection(db, "sickleaves"), where("userId", "==", user.id));
    const unsubSick = onSnapshot(qSick, (snap) => setSickLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() } as SickLeaveEntry))));

    return () => {
      unsubFeed(); unsubUsers(); unsubRoster(); unsubBoard(); unsubSick();
    };
  }, [user]);

  // 3. Realtime Chat Listener
  useEffect(() => {
    if (!user || !selectedChatUser) {
      setMessages([]);
      return;
    }

    // AI Chat Case (Optional logic if selectedChatUser.id === 'ai')
    if (selectedChatUser.id === 'ai') {
        setMessages([{ id: 'welcome', senderId: 'ai', text: 'Hallo! Ich bin dein KI-Assistent. Wie kann ich helfen?', timestamp: Timestamp.now(), isAi: true }]);
        return;
    }

    // User-to-User Chat Case
    // We want messages where (sender=Me AND receiver=Selected) OR (sender=Selected AND receiver=Me)
    const qMsgs = query(
      collection(db, "messages"),
      or(
        and(where("senderId", "==", user.id), where("receiverId", "==", selectedChatUser.id)),
        and(where("senderId", "==", selectedChatUser.id), where("receiverId", "==", user.id))
      ),
      orderBy("timestamp", "asc")
    );

    const unsubMsgs = onSnapshot(qMsgs, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });

    return () => unsubMsgs();
  }, [user, selectedChatUser]);

  useEffect(() => {
    if (activeView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: userCredential.user.uid,
        name: regName,
        email: email,
        role: 'Pflegefachkraft',
        avatar: `https://picsum.photos/seed/${regName}/100/100`,
        score: 0,
        isAdmin: false
      };
      await setDoc(doc(db, "users", newUser.id), newUser);
      await updateProfile(userCredential.user, { displayName: regName });
      setUser(newUser);
    } catch (err: any) {
      setError(err.message || "Registrierung fehlgeschlagen.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Login fehlgeschlagen. Bitte Daten prüfen.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthMode('login');
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    const storageRef = ref(storage, `avatars/${user.id}`);
    
    try {
      setIsLoading(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
      }
      
      // Update Firestore
      await updateDoc(doc(db, "users", user.id), { avatar: downloadURL });
      setUser(prev => prev ? { ...prev, avatar: downloadURL } : null);
      alert("Profilbild erfolgreich aktualisiert!");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Hochladen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !selectedChatUser) return;
    const text = inputText;
    setInputText('');

    if (selectedChatUser.id === 'ai') {
        const newUserMsg: Message = { id: Date.now().toString(), senderId: user.id, receiverId: 'ai', text, timestamp: Timestamp.now() };
        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);
        const aiAnswer = await getAiResponse(text);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), senderId: 'ai', text: aiAnswer, timestamp: Timestamp.now(), isAi: true }]);
        setIsTyping(false);
        return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.id,
        receiverId: selectedChatUser.id,
        text: text,
        timestamp: Timestamp.now()
      });
    } catch (err) {
      alert("Fehler beim Senden.");
    }
  };

  const handleAddSickLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await addDoc(collection(db, "sickleaves"), {
        userId: user.id,
        userName: user.name,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: 'pending',
        createdAt: Timestamp.now()
      });
      alert("Krankmeldung eingereicht!");
      setActiveView('dashboard');
    } catch (err) {
      alert("Fehler beim Einreichen.");
    }
  };

  const handleAddBoardNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await addDoc(collection(db, "board"), {
        author: user.name,
        title: formData.get('title'),
        content: formData.get('content'),
        color: 'bg-orange-100',
        createdAt: Timestamp.now(),
        timestamp: 'Gerade eben'
      });
      form.reset();
    } catch (err) {
      alert("Fehler beim Erstellen der Notiz.");
    }
  };

  const handleAddPost = async () => {
    if (!newPostContent.trim() || !user) return;
    try {
      await addDoc(collection(db, "posts"), {
        author: user.name,
        content: newPostContent,
        likes: 0,
        timestamp: 'Gerade eben',
        createdAt: Timestamp.now()
      });
      setNewPostContent('');
    } catch (err) {
      alert("Fehler beim Erstellen des Posts.");
    }
  };

  const handleChangeRole = async (targetUid: string, newRole: 'admin' | 'mitarbeiter') => {
    setIsProcessingRole(targetUid);
    try {
      const setUserRoleFn = httpsCallable(functions, 'setUserRole');
      await setUserRoleFn({ targetUid, role: newRole });
      await updateDoc(doc(db, "users", targetUid), {
        isAdmin: newRole === 'admin',
        role: newRole === 'admin' ? 'Administrator' : 'Pflegefachkraft'
      });
      alert(`Rolle erfolgreich auf ${newRole} aktualisiert.`);
    } catch (err: any) {
      alert("Fehler: " + err.message);
    } finally {
      setIsProcessingRole(null);
    }
  };

  const updateScore = async (points: number) => {
    if (!user) return;
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, { score: increment(points) });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="text-brand-orange animate-spin mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Daten-Synchronisierung...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-burgundy/5 rounded-full blur-[120px]"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="flex justify-center mb-10">
            <Logo variant="full" />
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white">
            <h2 className="text-2xl font-black text-brand-burgundy text-center mb-8 tracking-tight">
              {authMode === 'login' ? 'HorizontOS-Login' : 'Neu im Team?'}
            </h2>
            
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex gap-2"><AlertCircle size={18} />{error}</div>}
            
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authMode === 'register' && (
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Vollständiger Name" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 pl-12 focus:border-brand-orange outline-none transition-all font-medium" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 pl-12 focus:border-brand-orange outline-none transition-all font-medium" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 pl-12 focus:border-brand-orange outline-none transition-all font-medium" />
              </div>
              <button type="submit" className="w-full bg-brand-orange text-white font-black py-5 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] mt-4 transition-all uppercase text-xs tracking-widest">
                {authMode === 'login' ? 'Anmelden' : 'Registrieren'}
              </button>
            </form>

            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full mt-8 text-brand-burgundy font-bold text-sm hover:underline">
              {authMode === 'login' ? 'Noch keinen Zugang? Hier registrieren' : 'Bereits im Team? Zum Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-4xl font-black text-brand-burgundy tracking-tighter leading-none mb-1">Willkommen zurück, {user.name.split(' ')[0]}!</h2>
              <p className="text-slate-500 font-medium italic">Deine digitale Arbeitswelt von Horizont.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-brand-gradient rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black mb-4 tracking-tighter">Dein Horizont Score</h2>
                    <p className="text-6xl font-black">{user.score} <span className="text-2xl font-medium opacity-60">pts</span></p>
                    <button onClick={() => setActiveView('games')} className="mt-8 bg-white text-brand-orange px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">Jetzt spielen & sammeln <ArrowUpRight size={16} /></button>
                  </div>
                  <Sparkles className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/10" />
                </div>

                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-brand-burgundy tracking-tight flex items-center gap-2 text-xl"><Rss size={24} className="text-brand-orange" /> Aktuelle News</h3>
                    <button onClick={() => setActiveView('feed')} className="text-brand-orange font-bold text-xs uppercase tracking-widest">Feed öffnen</button>
                  </div>
                  <div className="space-y-4">
                    {feed.slice(0, 3).map(post => (
                      <div key={post.id} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                        <p className="text-sm font-bold text-slate-800 mb-1">{post.content}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.timestamp} von {post.author}</p>
                      </div>
                    ))}
                    {feed.length === 0 && <p className="text-center py-4 text-slate-400 italic">Noch keine News vorhanden.</p>}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full">
                  <h3 className="font-black text-brand-burgundy tracking-tight text-xl mb-6 flex items-center gap-2"><Trophy size={24} className="text-yellow-500" /> Top-Kollegen</h3>
                  <div className="space-y-3">
                    {allUsers.slice(0, 5).map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-sm font-bold">{u.name}</span>
                        </div>
                        <span className="text-xs font-black text-brand-orange">{u.score} pts</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        );

      case 'chat':
        const filteredUsers = allUsers.filter(u => u.id !== user.id && u.name.toLowerCase().includes(searchUserQuery.toLowerCase()));
        return (
          <div className="max-w-6xl mx-auto h-[80vh] bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            {/* User Directory Sidebar */}
            <aside className={`w-full md:w-80 border-r border-slate-50 flex flex-col ${selectedChatUser ? 'hidden md:flex' : 'flex'}`}>
              <header className="p-6 border-b border-slate-50">
                <h3 className="text-xl font-black text-brand-burgundy mb-4">Nachrichten</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Kollegen suchen..." 
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-orange/20" 
                  />
                </div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button 
                  onClick={() => setSelectedChatUser({ id: 'ai', name: 'Horizont KI', avatar: '', score: 0, isAdmin: false, role: 'KI', email: '' })}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedChatUser?.id === 'ai' ? 'bg-brand-orange/10 text-brand-orange' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white"><Sparkles size={20} /></div>
                  <div className="text-left"><p className="font-bold text-sm">Horizont KI</p><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Assistent</p></div>
                </button>
                <div className="py-2"><p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mitarbeiter</p></div>
                {filteredUsers.map(u => (
                  <button 
                    key={u.id} 
                    onClick={() => setSelectedChatUser(u)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedChatUser?.id === u.id ? 'bg-brand-burgundy/10 text-brand-burgundy' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="text-left"><p className="font-bold text-sm">{u.name}</p><p className="text-[10px] font-medium opacity-60">{u.role}</p></div>
                  </button>
                ))}
                {filteredUsers.length === 0 && <p className="text-center py-10 text-slate-300 text-xs italic">Niemand gefunden.</p>}
              </div>
            </aside>

            {/* Chat Content */}
            <main className={`flex-1 flex flex-col ${!selectedChatUser ? 'hidden md:flex bg-slate-50/30' : 'flex'}`}>
              {selectedChatUser ? (
                <>
                  <header className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedChatUser(null)} className="md:hidden p-2 -ml-2 text-slate-400"><ChevronLeft /></button>
                      {selectedChatUser.id === 'ai' ? (
                        <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white"><Sparkles size={24} /></div>
                      ) : (
                        <img src={selectedChatUser.avatar} className="w-12 h-12 rounded-2xl object-cover" />
                      )}
                      <div>
                        <h3 className="font-black text-brand-burgundy leading-none mb-1">{selectedChatUser.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedChatUser.id === 'ai' ? 'KI Begleiter' : selectedChatUser.role}</p>
                      </div>
                    </div>
                  </header>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {messages.map(msg => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-6 py-4 rounded-[2rem] text-sm font-medium leading-relaxed ${isMe ? 'bg-brand-orange text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && <div className="flex justify-start animate-pulse"><div className="bg-slate-100 px-6 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Schreibt gerade...</div></div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-6 border-t border-slate-50 bg-white">
                    <div className="flex gap-4">
                      <input 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()} 
                        placeholder="Deine Nachricht..." 
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-orange/20" 
                      />
                      <button 
                        onClick={handleSendMessage} 
                        className="bg-brand-orange text-white p-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-orange/20"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30">
                  <div className="w-24 h-24 bg-brand-burgundy/10 rounded-[2.5rem] flex items-center justify-center text-brand-burgundy mb-6"><MessageCircle size={48} /></div>
                  <h3 className="text-2xl font-black text-brand-burgundy">Wähle einen Kollegen</h3>
                  <p className="font-medium text-slate-500 max-w-xs mt-2">Klicke links auf einen Namen, um eine Unterhaltung zu starten.</p>
                </div>
              )}
            </main>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <header className="text-center">
              <h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">Mein Profil</h2>
              <p className="text-slate-500 font-medium italic">Verwalte deine persönlichen Daten.</p>
            </header>

            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="h-32 bg-brand-gradient"></div>
                <div className="px-10 pb-10 -mt-16 text-center">
                    <div className="relative inline-block group">
                        <img 
                            src={user.avatar} 
                            className="w-32 h-32 rounded-[2.5rem] border-4 border-white object-cover shadow-xl" 
                        />
                        <label className="absolute bottom-1 right-1 bg-brand-orange text-white p-3 rounded-2xl cursor-pointer shadow-lg hover:scale-110 transition-all border-2 border-white">
                            <Camera size={20} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                        </label>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-2xl font-black text-brand-burgundy tracking-tight">{user.name}</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{user.role}</p>
                    </div>
                    
                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-Mail</p>
                            <p className="font-bold text-slate-700">{user.email}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mitglied seit</p>
                            <p className="font-bold text-slate-700">2024</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-brand-orange/5 p-6 rounded-[2rem] border border-brand-orange/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-orange"><Trophy size={24} /></div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Bonus-Punktestand</p>
                                <p className="text-2xl font-black text-brand-burgundy tracking-tighter">{user.score} pts</p>
                            </div>
                        </div>
                        <button onClick={() => setActiveView('leaderboard')} className="text-brand-burgundy hover:bg-white p-2 rounded-xl transition-all"><ArrowUpRight size={24} /></button>
                    </div>

                    <div className="mt-10 pt-10 border-t border-slate-50 flex flex-col gap-3">
                        {/* Fix: Replaced missing LogOut reference with the correctly imported icon */}
                        <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all uppercase text-[10px] tracking-widest"><LogOut size={16} /> Abmelden</button>
                    </div>
                </div>
            </div>
          </div>
        );

      case 'sickleave':
        return (
          <div className="max-w-2xl mx-auto">
             <header className="mb-8"><h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">Krankmeldung einreichen</h2><p className="text-slate-500 font-medium italic">Unkompliziert und digital.</p></header>
             <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
               <form onSubmit={handleAddSickLeave} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                   <div><label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Erster Tag</label><input type="date" name="startDate" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-orange/20 outline-none" /></div>
                   <div><label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Voraussichtlich bis</label><input type="date" name="endDate" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-orange/20 outline-none" /></div>
                 </div>
                 <div><label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Attest / Foto</label><div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 hover:border-brand-orange transition-all cursor-pointer"><FileUp size={32} className="mx-auto mb-2" /><p className="text-sm font-bold">PDF oder Bild hochladen</p></div></div>
                 <button type="submit" className="w-full bg-brand-burgundy text-white font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:brightness-110 transition-all">Meldung Abschicken</button>
               </form>
             </div>
             <div className="mt-8 space-y-4">
               <h3 className="font-black text-brand-burgundy text-lg">Meine Meldungen</h3>
               {sickLeaves.map(entry => (
                 <div key={entry.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div><p className="font-bold text-sm">{entry.startDate} bis {entry.endDate}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: {entry.status}</p></div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{entry.status}</span>
                 </div>
               ))}
               {sickLeaves.length === 0 && <p className="text-center py-6 text-slate-300 italic text-sm">Keine aktuellen Meldungen.</p>}
             </div>
          </div>
        );

      case 'roster':
        return (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <header className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div><h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">Dienstplan</h2><p className="text-slate-500 font-medium">Deine aktuelle Arbeitswoche.</p></div>
              <Calendar className="text-brand-orange" size={32} />
            </header>
            <div className="p-8 space-y-4">
               {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((day, i) => {
                 const shift = rosterData.find(r => r.day === day && r.userId === user.id);
                 return (
                   <div key={day} className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all ${shift ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-slate-50 border-transparent opacity-60'}`}>
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.substring(0,2)}</span>
                        <span className="text-lg font-black text-brand-burgundy">{i + 1}.</span>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-brand-burgundy text-lg">{shift ? shift.shift : 'FREI'}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{shift ? shift.time : 'Genieße den freien Tag!'}</p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        );

      case 'board':
        return (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div><h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">Digitale Pinnwand</h2><p className="text-slate-500 font-medium italic">Informationen für alle.</p></div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-dashed border-slate-200">
                <h3 className="font-black text-brand-burgundy mb-4">Neue Notiz pinnen</h3>
                <form onSubmit={handleAddBoardNote} className="space-y-4">
                  <input name="title" placeholder="Worum geht es?" required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-orange/20" />
                  <textarea name="content" placeholder="Inhalt..." required rows={3} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-orange/20 resize-none" />
                  <button type="submit" className="w-full bg-brand-orange text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-brand-orange/20">Jetzt pinnen</button>
                </form>
              </div>
              {boardNotes.map(note => (
                <div key={note.id} className={`${note.color || 'bg-white'} p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:scale-[1.02] transition-transform`}>
                  <h4 className="font-black text-brand-burgundy text-lg mb-2">{note.title}</h4>
                  <p className="text-slate-600 font-medium text-sm mb-6">{note.content}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[10px] uppercase text-brand-burgundy">{note.author[0]}</div>
                    <div><p className="text-[10px] font-black text-brand-burgundy leading-none uppercase">{note.author}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{note.timestamp}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'games':
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <header className="text-center"><h2 className="text-4xl font-black text-brand-burgundy tracking-tighter mb-4 italic">Spielhalle</h2><p className="text-slate-500 font-medium italic">Sammle Punkte für dein Team-Konto.</p></header>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { id: 'snake', label: 'Snake Master', icon: '🐍', color: 'bg-green-500' },
                { id: 'memory', label: 'Gedächtnis Pro', icon: '🧩', color: 'bg-blue-500' },
                { id: 'whack', label: 'Mole Smash', icon: '🐹', color: 'bg-amber-600' }
              ].map(g => (
                <button key={g.id} onClick={() => setCurrentGame(g.id as any)} className={`${currentGame === g.id ? 'ring-4 ring-brand-orange scale-105' : 'hover:scale-105'} bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-4 transition-all w-48`}>
                  <div className={`${g.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>{g.icon}</div>
                  <h3 className="font-black text-brand-burgundy text-sm">{g.label}</h3>
                </button>
              ))}
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
               {currentGame === 'none' ? <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">Wähle ein Spiel zum Starten</div> :
                currentGame === 'snake' ? <Snake onScoreUpdate={(s) => s % 50 === 0 && updateScore(5)} /> :
                currentGame === 'memory' ? <Memory onScoreUpdate={() => updateScore(10)} /> :
                <WhackAMole onScoreUpdate={() => updateScore(2)} />}
            </div>
          </div>
        );

      case 'admin-users':
        if (!user.isAdmin) return <div className="p-20 text-center font-black">ZUGRIFF VERWEIGERT</div>;
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">Mitarbeiter-Verwaltung</h2>
              <p className="text-slate-500 font-medium italic">Verwalte Berechtigungen und Profile.</p>
            </header>
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400"><th className="px-6 py-4">Mitarbeiter</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aktionen</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                        <div><p className="font-bold text-sm">{u.name}</p><p className="text-[10px] text-slate-400">{u.email}</p></div>
                      </td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isAdmin ? 'bg-brand-burgundy text-white' : 'bg-slate-100 text-slate-400'}`}>{u.isAdmin ? 'Admin' : 'Mitarbeiter'}</span></td>
                      <td className="px-6 py-4 text-right">
                        {u.id !== user.id && (
                          <button onClick={() => handleChangeRole(u.id, u.isAdmin ? 'mitarbeiter' : 'admin')} disabled={isProcessingRole === u.id} className="text-brand-orange hover:bg-brand-orange/5 p-2 rounded-xl transition-all">
                            {isProcessingRole === u.id ? <Loader2 className="animate-spin" size={16} /> : u.isAdmin ? <Shield size={16} /> : <ShieldCheck size={16} />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'feed':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <header className="text-center mb-10"><h2 className="text-4xl font-black text-brand-burgundy tracking-tighter">Horizont News</h2><p className="text-slate-500 font-medium italic">Immer informiert.</p></header>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex gap-4">
               <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
               <div className="flex-1 flex gap-2">
                 <input value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Teile etwas mit dem Team..." className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-brand-orange/20" />
                 <button onClick={handleAddPost} className="bg-brand-orange text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Plus size={20} /></button>
               </div>
            </div>
            {feed.map(post => (
              <article key={post.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center font-black text-brand-orange">{post.author[0]}</div>
                    <div><h4 className="font-black text-brand-burgundy leading-none mb-1">{post.author}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.timestamp}</p></div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">{post.content}</p>
                </div>
                <div className="px-8 py-4 bg-slate-50 flex gap-6"><button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-orange uppercase tracking-widest"><Heart size={16} /> {post.likes}</button></div>
              </article>
            ))}
          </div>
        );

      case 'leaderboard':
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="text-center">
                    <h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">Highscore-Liste</h2>
                    <p className="text-slate-500 font-medium italic">Wer sammelt die meisten Punkte?</p>
                </header>
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 space-y-2">
                        {allUsers.map((u, i) => (
                            <div key={u.id} className={`flex items-center justify-between p-4 rounded-2xl ${u.id === user.id ? 'bg-brand-orange/5 border border-brand-orange/20' : 'bg-slate-50'}`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>
                                        {i + 1}
                                    </span>
                                    <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{u.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-brand-orange">{u.score} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

      default:
        return <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">Bereich: {activeView}</div>;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} user={user!} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;
