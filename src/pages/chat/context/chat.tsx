import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from "../../../config/firebase";
import { useAuth } from "../../../context/AuthContext";
import { Inbox } from "common/types/common.type";

type User = {
  id: string;
  name: string;
  image: string;
};

type ChatContextProp = {
  user: User;
  inbox: Inbox[];
  activeChat?: Inbox;
  onChangeChat: (chat: Inbox) => void;
  loading: boolean;
};

const initialValue: ChatContextProp = {
  user: { 
    id: "current_user_123", 
    name: "Jazim Abbas", 
    image: "/assets/images/girl.jpeg" 
  },
  inbox: [],
  onChangeChat() {
    throw new Error();
  },
  loading: true,
};

export const ChatContext = React.createContext<ChatContextProp>(initialValue);

export default function ChatProvider(props: { children: any }) {
  const { children } = props;
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User>(initialValue.user);
  const [inbox, setInbox] = useState<Inbox[]>([]);
  const [activeChat, setActiveChat] = useState<Inbox>();
  const [loading, setLoading] = useState(true);

  // Update user ID when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUser({
        id: currentUser.uid, // Use actual Firebase UID
        name: currentUser.displayName || currentUser.phoneNumber || "Current User",
        image: currentUser.photoURL || "/assets/images/profile.png"
      });
    }
  }, [currentUser]);

  // Fetch real users from Firebase
  useEffect(() => {
    if (!db || !currentUser) {
      setLoading(false);
      return;
    }

    console.log('🔍 Fetching real users for sidebar...');

    // Create a query to get all users ordered by creation date
    let usersQuery;
    try {
      usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
    } catch (error) {
      console.warn('⚠️ OrderBy query failed, using simple collection query:', error);
      usersQuery = query(collection(db, 'users'));
    }

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const userList: Inbox[] = [];
        console.log('🔍 Fetched users for sidebar:', snapshot.size);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🔍 User data from Firestore:', {
            id: doc.id,
            username: data.username,
            createdAt: data.createdAt,
            createdAtType: typeof data.createdAt,
            hasToDate: data.createdAt && typeof data.createdAt.toDate === 'function'
          });
          
          // Skip the current user
          if (currentUser && doc.id === currentUser.uid) {
            console.log('🚫 Skipping current user in sidebar:', data.username);
            return;
          }

                     // Convert Firebase user to Inbox format (WhatsApp-style)
           const inboxUser: Inbox = {
             id: doc.id,
             name: data.displayName || data.username || 'Unknown User',
             image: data.photoURL || "/assets/images/profile.png",
             lastMessage: "Tap to start chatting",
             messageStatus: "SENT",
             timestamp: (() => {
               try {
                 if (data.createdAt) {
                   // Check if it's a Firestore Timestamp
                   if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
                     return new Date(data.createdAt.toDate()).toLocaleTimeString('en-US', { 
                       hour: '2-digit', 
                       minute: '2-digit' 
                     });
                   }
                   // If it's a regular Date object or string
                   if (data.createdAt instanceof Date) {
                     return data.createdAt.toLocaleTimeString('en-US', { 
                       hour: '2-digit', 
                       minute: '2-digit' 
                     });
                   }
                   // If it's a string, try to parse it
                   if (typeof data.createdAt === 'string') {
                     return new Date(data.createdAt).toLocaleTimeString('en-US', { 
                       hour: '2-digit', 
                       minute: '2-digit' 
                     });
                   }
                 }
                 // Fallback to current time
                 return new Date().toLocaleTimeString('en-US', { 
                   hour: '2-digit', 
                   minute: '2-digit' 
                 });
               } catch (error) {
                 console.warn('Error parsing createdAt for user:', doc.id, error);
                 return new Date().toLocaleTimeString('en-US', { 
                   hour: '2-digit', 
                   minute: '2-digit' 
                 });
               }
             })(),
             notificationsCount: 0,
             isOnline: false,
           };
          
          userList.push(inboxUser);
        });
        
        console.log('✅ Sidebar users (excluding current user):', userList.length);
        console.log('👥 Sidebar users:', userList.map(u => u.name));
        
        setInbox(userList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching users for sidebar:', err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const handleChangeChat = (chat: Inbox) => {
    setActiveChat(chat);
  };

  return (
    <ChatContext.Provider value={{ user, inbox, activeChat, onChangeChat: handleChangeChat, loading }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => React.useContext(ChatContext);
