import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppTheme } from "common/theme";
import { useChatContext } from "../../context/chat";
import { useAuth } from "../../../../context/AuthContext";
import InboxContact from "./contacts";
import NavigationMenu from "./NavigationMenu";
import UserSearch from "../../../../components/UserSearch";
import { SearchResult } from "../../../../utils/firebaseUsers";
import {
  SidebarContainer,
  Header,
  Actions,
  ThemeIconContainer,
  ContactContainer,
  ImageWrapper,
  Avatar,
} from "./styles";
import Icon from "common/components/icons";
import SidebarAlert from "./alert";
import SearchField from "../search-field";

export default function Sidebar() {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const chatCtx = useChatContext();
  const [showUserSearch, setShowUserSearch] = useState(false);
  // const { user: currentUser } = useAuth();

  const handleChangeThemeMode = () => {
    theme.onChangeThemeMode();
  };

  const handleChangeChat = (chat: any) => {
    chatCtx.onChangeChat(chat);
    navigate("/" + chat.id);
  };

  const handleUserSelect = (user: SearchResult) => {
    // Create a new chat with the selected user
    const newChat = {
      id: user.id,
      name: user.displayName || user.username,
      image: user.photoURL || "/assets/images/profile.png",
      lastMessage: "Start a conversation",
      messageStatus: "SENT" as const,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      notificationsCount: 0,
      isOnline: false,
    };
    
    chatCtx.onChangeChat(newChat);
    setShowUserSearch(false);
  };



  return (
    <SidebarContainer>
      <Header>
        <ImageWrapper>
          <Avatar src="/assets/images/profile.png" />
        </ImageWrapper>
        <Actions>
          <ThemeIconContainer onClick={handleChangeThemeMode}>
            {theme.mode === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </ThemeIconContainer>
          <button aria-label="Status">
            <Icon id="status" className="icon" />
          </button>
          <button aria-label="New chat">
            <Icon id="chat" className="icon" />
          </button>
          <button 
            aria-label="User List" 
            onClick={() => navigate("/users")}
            className="icon"
            style={{ cursor: 'pointer' }}
          >
            <Icon id="emojiPeople" className="icon" />
          </button>
          <NavigationMenu
            iconClassName="icon"
            className="icon"
            ariaLabel="Menu"
            iconId="menu"
          />
        </Actions>
      </Header>

      {/* WhatsApp-style New Chat Button */}
      <div className="px-4 py-2 border-b border-gray-200">
        <button
          onClick={() => setShowUserSearch(!showUserSearch)}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* WhatsApp-style User Search */}
      {showUserSearch && (
        <div className="px-4 py-3 border-b border-gray-200">
          <UserSearch
            onUserSelect={handleUserSelect}
            placeholder="Search or start a new chat"
            maxResults={10}
          />
        </div>
      )}

      <SidebarAlert />
      <SearchField />
      <ContactContainer>
        {chatCtx.loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Loading contacts...</span>
          </div>
        ) : chatCtx.inbox.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-900">No contacts found</p>
            <p className="text-xs text-gray-500 mt-1">Other users will appear here when they sign up</p>
          </div>
        ) : (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacts ({chatCtx.inbox.length})
            </div>
            {chatCtx.inbox.map((inbox) => (
              <InboxContact
                key={inbox.id}
                inbox={inbox}
                isActive={inbox.id === chatCtx.activeChat?.id}
                onChangeChat={handleChangeChat}
              />
            ))}
          </div>
        )}
      </ContactContainer>
    </SidebarContainer>
  );
}
