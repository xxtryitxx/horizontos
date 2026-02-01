
export type AppView = 'dashboard' | 'chat' | 'roster' | 'sickleave' | 'games' | 'giveaways' | 'surveys' | 'feed' | 'board' | 'leaderboard' | 'admin-users' | 'profile' | 'analytics' | 'file-share' | 'shift-swap' | 'voice-messages' | 'shift-trading' | 'feedback' | 'mentoring' | 'knowledge-base' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  score: number;
  isAdmin: boolean;
  status?: 'User' | 'Admin' | 'Mitarbeiter';
  locked?: boolean;
  lockedAt?: any;
  createdAt?: any;
  lastSeen?: any;
  isOnline?: boolean;
  birthday?: string;
  badges?: string[];
  darkMode?: boolean;
  mentorId?: string;
  mentees?: string[];
  notificationsEnabled?: boolean;
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

// NEW FEATURES TYPES

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: any;
  unlocked: boolean;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName?: string;
  shiftTime: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export interface TeamChannel {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt?: any;
}

export interface ChannelMessage extends Message {
  channelId: string;
  reactions?: { emoji: string; users: string[] }[];
}

export interface VoiceMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  channelId?: string;
  duration: number;
  url: string;
  mimeType: string;
  timestamp: any;
}

export interface FileShare {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: any;
  conversationId?: string;
}

export interface ShiftTrade {
  id: string;
  requesterId: string;
  requesterName: string;
  offeringShift: string;
  seekingShift: string;
  volunteers?: string[];
  assignedTo?: string;
  status: 'open' | 'assigned' | 'completed';
  createdAt?: any;
}

export interface Feedback {
  id: string;
  userId: string;
  rating: number;
  category: 'app' | 'features' | 'bugs' | 'performance' | 'design' | 'other';
  message: string;
  timestamp: number;
  createdAt?: any;
}

export interface MentoringTask {
  id: string;
  mentorId: string;
  menteeId: string;
  description: string;
  dueDate: any;
  completed: boolean;
  completedAt?: any;
  createdAt?: any;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  views?: number;
  authorName: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'shift' | 'chat' | 'swap' | 'feedback' | 'achievement' | 'reminder' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt?: any;
}
