/**
 * Features Service - Alle neuen Pro-Features
 * Push Notifications, Online Status, Achievements, etc.
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDoc,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  Timestamp,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Achievement,
  ShiftSwapRequest,
  TeamChannel,
  ChannelMessage,
  VoiceMessage,
  FileShare,
  ShiftTrade,
  Feedback,
  MentoringTask,
  KnowledgeArticle,
  Notification,
} from "../types";

// ============================================
// ONLINE STATUS
// ============================================

export async function setUserOnline(userId: string) {
  try {
    await updateDoc(doc(db, "users", userId), {
      isOnline: true,
      lastSeen: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("❌ Online Status Error:", error.message);
  }
}

export async function setUserOffline(userId: string) {
  try {
    await updateDoc(doc(db, "users", userId), {
      isOnline: false,

    // Try to send via Vercel serverless endpoint (if deployed). We fetch recipient email from users collection.
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      const toEmail = userSnap && userSnap.exists() ? (userSnap.data() as any).email : null;
      if (toEmail) {
        // fire-and-forget POST to local API route
        fetch('/api/sendNotificationEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: toEmail, subject: title, text: message, data })
        }).catch(e => console.warn('Vercel email endpoint failed:', e));
      }
    } catch (e) {
      console.warn('Could not send via Vercel endpoint:', e);
    }
      lastSeen: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("❌ Offline Status Error:", error.message);
  }
}

// ============================================
// ACHIEVEMENTS/BADGES
// ============================================

export async function checkAndUnlockAchievements(userId: string, userScore: number) {
  const badges: string[] = [];

  if (userScore >= 100) badges.push("Superstar");
  if (userScore >= 200) badges.push("Legend");
  if (userScore >= 50) badges.push("Helper");

  if (badges.length > 0) {
    await updateDoc(doc(db, "users", userId), {
      badges: badges,
    });
  }

  return badges;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "superstar",
    name: "Superstar",
    description: "100+ Punkte erreicht",
    icon: "⭐",
    unlocked: false,
  },
  {
    id: "legend",
    name: "Legend",
    description: "200+ Punkte erreicht",
    icon: "👑",
    unlocked: false,
  },
  {
    id: "helper",
    name: "Helper",
    description: "50+ Punkte erreicht",
    icon: "🤝",
    unlocked: false,
  },
  {
    id: "gamer",
    name: "Gamer",
    description: "5+ Spiele gespielt",
    icon: "🎮",
    unlocked: false,
  },
];

// ============================================
// SHIFT SWAP REQUESTS
// ============================================

export async function createShiftSwapRequest(
  requesterId: string,
  requesterName: string,
  targetUserId: string,
  targetUserName: string,
  originalShift: string,
  requestedShift: string
) {
  try {
    const docRef = await addDoc(collection(db, "shiftSwapRequests"), {
      requesterId,
      requesterName,
      recipientId: targetUserId,
      recipientName: targetUserName,
      originalShift,
      requestedShift,
      shiftTime: requestedShift || originalShift,
      status: "pending",
      createdAt: Timestamp.now(),
    });

    // Notify the recipient
    try {
      await createNotification(
        targetUserId,
        "shift_swap",
        "Schichttausch-Anfrage",
        `${requesterName} hat eine Tausch-Anfrage für ${requestedShift || originalShift} gesendet.`,
        { requestId: docRef.id }
      );
    } catch (nerr) {
      console.warn("Warnung: Notification konnte nicht erstellt werden:", nerr);
    }
    console.log("✅ Shift Swap Request created");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

export async function approveShiftSwap(requestId: string) {
  try {
    await updateDoc(doc(db, "shiftSwapRequests", requestId), {
      status: "approved",
    });
    // Notify requester about approval
    try {
      const reqRef = doc(db, "shiftSwapRequests", requestId);
      const snap = await getDoc(reqRef);
      if (snap.exists()) {
        const data: any = snap.data();
        if (data.requesterId) {
          await createNotification(
            data.requesterId,
            "shift_swap",
            "Schichttausch genehmigt",
            `Deine Anfrage an ${data.recipientName || 'Kollege'} wurde genehmigt.`,
            { requestId }
          );
        }
      }
    } catch (nerr) {
      console.warn("Warnung: Notification bei Genehmigung fehlgeschlagen:", nerr);
    }
    console.log("✅ Shift Swap approved");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// TEAM CHANNELS
// ============================================

export async function createTeamChannel(
  name: string,
  description: string,
  createdBy: string,
  members: string[]
) {
  try {
    await addDoc(collection(db, "teamChannels"), {
      name,
      description,
      members,
      createdBy,
      createdAt: Timestamp.now(),
    });
    console.log("✅ Team Channel created");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

export async function sendChannelMessage(
  channelId: string,
  senderId: string,
  text: string
) {
  try {
    await addDoc(collection(db, "channelMessages"), {
      channelId,
      senderId,
      text,
      timestamp: Timestamp.now(),
    });
    console.log("✅ Channel message sent");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// VOICE MESSAGES
// ============================================

export async function uploadVoiceMessage(
  senderId: string,
  receiverId: string | undefined,
  channelId: string | undefined,
  duration: number,
  audioUrl: string
) {
  try {
    await addDoc(collection(db, "voiceMessages"), {
      senderId,
      receiverId,
      channelId,
      duration,
      audioUrl,
      timestamp: Timestamp.now(),
    });
    console.log("✅ Voice message uploaded");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// FILE SHARING
// ============================================

export async function uploadFileShare(
  name: string,
  size: number,
  type: string,
  url: string,
  uploadedBy: string,
  conversationId?: string
) {
  try {
    await addDoc(collection(db, "fileShares"), {
      name,
      size,
      type,
      url,
      uploadedBy,
      conversationId,
      uploadedAt: Timestamp.now(),
    });
    console.log("✅ File uploaded");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// SHIFT TRADING
// ============================================

export async function createShiftTradeRequest(
  requesterId: string,
  requesterName: string,
  shiftDate: string,
  description: string
) {
  try {
    await addDoc(collection(db, "shiftTrades"), {
      requesterId,
      requesterName,
      shiftDate,
      description,
      volunteers: [],
      status: "open",
      createdAt: Timestamp.now(),
    });
    console.log("✅ Shift trade request created");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

export async function volunteersForShiftTrade(tradeId: string, userId: string) {
  try {
    const tradeDoc = await getDocs(query(collection(db, "shiftTrades")));
    const trade = tradeDoc.docs.find(d => d.id === tradeId);
    if (trade) {
      const volunteers = trade.data().volunteers || [];
      await updateDoc(doc(db, "shiftTrades", tradeId), {
        volunteers: [...volunteers, userId],
      });
      console.log("✅ Volunteered for shift trade");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// FEEDBACK SYSTEM
// ============================================

export async function submitFeedback(
  fromUserId: string,
  toUserId: string,
  rating: number,
  comment: string,
  anonymous: boolean = false
) {
  try {
    await addDoc(collection(db, "feedback"), {
      fromUserId,
      toUserId,
      rating,
      comment,
      anonymous,
      createdAt: Timestamp.now(),
    });
    console.log("✅ Feedback submitted");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// MENTORING SYSTEM
// ============================================

export async function assignMentor(mentorId: string, menteeId: string) {
  try {
    await updateDoc(doc(db, "users", menteeId), {
      mentorId,
    });
    await updateDoc(doc(db, "users", mentorId), {
      mentees: increment(1),
    });
    console.log("✅ Mentor assigned");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

export async function createMentoringTask(
  mentorId: string,
  menteeId: string,
  title: string,
  description: string,
  dueDate: string
) {
  try {
    await addDoc(collection(db, "mentoringTasks"), {
      mentorId,
      menteeId,
      title,
      description,
      dueDate,
      completed: false,
      createdAt: Timestamp.now(),
    });
    console.log("✅ Mentoring task created");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// ============================================
// KNOWLEDGE BASE
// ============================================

export async function createKnowledgeArticle(
  title: string,
  content: string,
  category: string,
  tags: string[],
  createdBy: string
) {
  try {
    await addDoc(collection(db, "knowledgeBase"), {
      title,
      content,
      category,
      tags,
      views: 0,
      createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("✅ Knowledge article created");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

export async function searchKnowledgeBase(searchTerm: string) {
  try {
    const q = query(collection(db, "knowledgeBase"));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as KnowledgeArticle) } as KnowledgeArticle))
      .filter(
        (item: KnowledgeArticle) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.tags || []).some((tag: string) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    return results;
  } catch (error: any) {
    console.error("❌ Search error:", error.message);
    return [];
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      message,
      read: false,
      data,
      createdAt: Timestamp.now(),
    });
    console.log("✅ Notification created");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
    console.log("✅ Notification marked read", notificationId);
  } catch (error: any) {
    console.error("❌ Error marking notification read:", error.message);
    throw error;
  }
}

export function onNotificationsUpdated(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Notification)
    );
    callback(notifications);
  });
}

// ============================================
// BIRTHDAY CALENDAR
// ============================================

export async function getUsersBirthdayToday() {
  try {
    const today = new Date().toISOString().split("T")[0].substring(5); // MM-DD
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const birthdayUsers = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...(doc.data() as any) } as any))
      .filter(
        (user: any) =>
          user.birthday &&
          user.birthday.substring(5) === today
      );
    return birthdayUsers;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return [];
  }
}

// ============================================
// REAL-TIME LISTENERS
// ============================================

export function onShiftSwapsUpdated(
  targetUserId: string,
  callback: (swaps: ShiftSwapRequest[]) => void
) {
  const q = query(
    collection(db, "shiftSwapRequests"),
    where("recipientId", "==", targetUserId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const swaps = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ShiftSwapRequest)
    );
    callback(swaps);
  });
}

export function onTeamChannelsUpdated(
  userId: string,
  callback: (channels: TeamChannel[]) => void
) {
  const q = query(collection(db, "teamChannels"));

  return onSnapshot(q, (snapshot) => {
    const channels = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as TeamChannel))
      .filter(channel => channel.members.includes(userId));
    callback(channels);
  });
}

export function onChannelMessagesUpdated(
  channelId: string,
  callback: (messages: ChannelMessage[]) => void
) {
  const q = query(
    collection(db, "channelMessages"),
    where("channelId", "==", channelId),
    orderBy("timestamp", "asc"),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ChannelMessage)
    );
    callback(messages);
  });
}
