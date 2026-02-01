
import React from 'react';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Stethoscope, 
  Gamepad2, 
  Gift, 
  BarChart3, 
  Rss, 
  ClipboardList, 
  Trophy,
  Users,
  Settings,
  FileText,
  PlusCircle,
  User as UserIcon,
  Share2,
  Zap,
  Mic,
  BookOpen,
  Brain,
  Award,
  Send,
  TrendingUp
} from 'lucide-react';
import { Post, BoardNote } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, adminOnly: false },
  { id: 'feed', label: 'News-Feed', icon: <Rss size={20} />, adminOnly: false },
  { id: 'leaderboard', label: 'Highscore', icon: <Trophy size={20} />, adminOnly: false },
  { id: 'board', label: 'Pinnwand', icon: <ClipboardList size={20} />, adminOnly: false },
  { id: 'chat', label: 'Nachrichten', icon: <MessageSquare size={20} />, adminOnly: false },
  { id: 'roster', label: 'Dienstplan', icon: <Calendar size={20} />, adminOnly: false },
  { id: 'sickleave', label: 'Krankmeldung', icon: <Stethoscope size={20} />, adminOnly: false },
  { id: 'shift-swap', label: 'Schichtwechsel', icon: <Zap size={20} />, adminOnly: false },
  { id: 'shift-trading', label: 'Schicht-Handel', icon: <Award size={20} />, adminOnly: false },
  { id: 'voice-messages', label: 'Sprachnachrichten', icon: <Mic size={20} />, adminOnly: false },
  { id: 'file-share', label: 'Dateifreigabe', icon: <Share2 size={20} />, adminOnly: false },
  { id: 'feedback', label: 'Feedback', icon: <Send size={20} />, adminOnly: false },
  { id: 'mentoring', label: 'Mentoring', icon: <Brain size={20} />, adminOnly: false },
  { id: 'knowledge-base', label: 'Wissensdatenbank', icon: <BookOpen size={20} />, adminOnly: false },
  { id: 'games', label: 'Spielhalle', icon: <Gamepad2 size={20} />, adminOnly: false },
  { id: 'settings', label: 'Einstellungen', icon: <Settings size={20} />, adminOnly: false },
  { id: 'profile', label: 'Mein Profil', icon: <UserIcon size={20} />, adminOnly: false },
];

export const ADMIN_NAVIGATION_ITEMS = [
  { id: 'analytics', label: 'Analytics Dashboard', icon: <TrendingUp size={20} /> },
  { id: 'admin-users', label: 'Mitarbeiter', icon: <Users size={20} /> },
  { id: 'admin-roster', label: 'Dienstplan-Editor', icon: <Settings size={20} /> },
  { id: 'admin-news', label: 'News Posten', icon: <PlusCircle size={20} /> },
  { id: 'admin-sickleaves', label: 'Atteste prüfen', icon: <FileText size={20} /> },
];

export const MOCK_FEED: Post[] = [
  { id: '1', author: 'Horizont Team', content: 'Willkommen bei HorizontOS! Hier findest du alle wichtigen Informationen für deinen Arbeitsalltag. Alle 18 neuen Features sind jetzt verfügbar!', timestamp: 'Gerade eben', likes: 12, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
  { id: '2', author: 'Event-Management', content: 'Unser letztes Teamevent war ein voller Erfolg. Danke an alle, die dabei waren!', timestamp: 'Gestern', likes: 45 },
];

export const MOCK_BOARD: BoardNote[] = [
  { id: '1', author: 'Recruiting', title: 'Empfehlungsbonus', content: 'Empfiehl uns neue Kollegen und sichere dir einen Bonus von 500€!', color: 'bg-orange-100', timestamp: 'Heute' },
  { id: '2', author: 'Markus', title: 'Mittagspause', content: 'Heute gibt es Pizza für alle im Pausenraum!', color: 'bg-blue-100', timestamp: '2 Std.' },
];
