
export type AppView = 'dashboard' | 'chat' | 'roster' | 'sickleave' | 'games' | 'giveaways' | 'surveys' | 'feed' | 'board' | 'leaderboard' | 'admin-users' | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  score: number;
  isAdmin: boolean;
  locked?: boolean;
  lockedAt?: any;
  createdAt?: any;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  image?: string;
  createdAt?: any;
}

export interface BoardNote {
  id: string;
  author: string;
  title: string;
  content: string;
  color: string;
  timestamp: string;
  createdAt?: any;
}

export interface Survey {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  voted: boolean;
}

export interface Giveaway {
  id: string;
  title: string;
  prize: string;
  endDate: string;
  participants: number;
  joined: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; // New field for P2P chat
  text: string;
  timestamp: any;
  isAi?: boolean;
}

export interface SickLeaveEntry {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export interface RosterEntry {
  id: string;
  userId: string;
  userName: string;
  day: string;
  date: string;
  shift: string;
  time: string;
}
