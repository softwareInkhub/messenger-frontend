import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChatInvitation {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Send a chat invitation to another user
 */
export const sendChatInvitation = async (
  fromUserId: string,
  toUserId: string,
  fromUserName: string,
  toUserName: string,
  message?: string
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  if (fromUserId === toUserId) {
    throw new Error('Cannot send invitation to yourself');
  }

  const invitationId = `${fromUserId}_${toUserId}`;
  const invitationRef = doc(db, 'chatInvitations', invitationId);

  // Check if invitation already exists
  const existingInvitation = await getDoc(invitationRef);
  if (existingInvitation.exists()) {
    throw new Error('Invitation already sent to this user');
  }

  const invitation: ChatInvitation = {
    id: invitationId,
    fromUserId,
    toUserId,
    fromUserName,
    toUserName,
    message,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(invitationRef, invitation);
};

/**
 * Accept a chat invitation
 */
export const acceptChatInvitation = async (invitationId: string): Promise<string> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const invitationRef = doc(db, 'chatInvitations', invitationId);
  const invitationDoc = await getDoc(invitationRef);

  if (!invitationDoc.exists()) {
    throw new Error('Invitation not found');
  }

  const invitation = invitationDoc.data() as ChatInvitation;
  
  if (invitation.status !== 'pending') {
    throw new Error('Invitation is no longer pending');
  }

  // Update invitation status
  await setDoc(invitationRef, {
    ...invitation,
    status: 'accepted',
    updatedAt: Timestamp.now(),
  });

  // Create chat room
  const chatRoomId = `chat_${invitation.fromUserId}_${invitation.toUserId}`;
  const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

  const chatRoom: ChatRoom = {
    id: chatRoomId,
    participants: [invitation.fromUserId, invitation.toUserId],
    participantNames: {
      [invitation.fromUserId]: invitation.fromUserName,
      [invitation.toUserId]: invitation.toUserName,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(chatRoomRef, chatRoom);

  return chatRoomId;
};

/**
 * Decline a chat invitation
 */
export const declineChatInvitation = async (invitationId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const invitationRef = doc(db, 'chatInvitations', invitationId);
  const invitationDoc = await getDoc(invitationRef);

  if (!invitationDoc.exists()) {
    throw new Error('Invitation not found');
  }

  const invitation = invitationDoc.data() as ChatInvitation;
  
  if (invitation.status !== 'pending') {
    throw new Error('Invitation is no longer pending');
  }

  // Update invitation status
  await setDoc(invitationRef, {
    ...invitation,
    status: 'declined',
    updatedAt: Timestamp.now(),
  });
};

/**
 * Get pending invitations for a user
 */
export const getPendingInvitations = (userId: string, callback: (invitations: ChatInvitation[]) => void) => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const invitationsRef = collection(db, 'chatInvitations');
  const q = query(
    invitationsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const invitations: ChatInvitation[] = [];
    snapshot.forEach((doc) => {
      invitations.push(doc.data() as ChatInvitation);
    });
    callback(invitations);
  });
};

/**
 * Get chat rooms for a user
 */
export const getUserChatRooms = (userId: string, callback: (chatRooms: ChatRoom[]) => void) => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const chatRoomsRef = collection(db, 'chatRooms');
  const q = query(
    chatRoomsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chatRooms: ChatRoom[] = [];
    snapshot.forEach((doc) => {
      chatRooms.push(doc.data() as ChatRoom);
    });
    callback(chatRooms);
  });
};

/**
 * Get chat room by ID
 */
export const getChatRoom = async (chatRoomId: string): Promise<ChatRoom | null> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
  const chatRoomDoc = await getDoc(chatRoomRef);

  if (!chatRoomDoc.exists()) {
    return null;
  }

  return chatRoomDoc.data() as ChatRoom;
};

/**
 * Update chat room last message
 */
export const updateChatRoomLastMessage = async (
  chatRoomId: string, 
  lastMessage: string
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
  await setDoc(chatRoomRef, {
    lastMessage,
    lastMessageTime: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });
};
