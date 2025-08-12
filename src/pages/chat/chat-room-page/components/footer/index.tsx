import { useState } from "react";
import Icon from "common/components/icons";
import { useMessaging } from "../../../hooks/useMessaging";
import { useChatContext } from "../../../context/chat";
import {
  AttachButton,
  Button,
  ButtonsContainer,
  IconsWrapper,
  Input,
  SendMessageButton,
  Wrapper,
} from "./styles";

const attachButtons = [
  { icon: "attachRooms", label: "Choose room" },
  { icon: "attachContacts", label: "Choose contact" },
  { icon: "attachDocument", label: "Choose document" },
  { icon: "attachCamera", label: "Use camera" },
  { icon: "attachImage", label: "Choose image" },
];

export default function Footer() {
  const [showIcons, setShowIcons] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const { user, activeChat } = useChatContext();
  const { sendMessage, isConnected } = useMessaging(user.id, activeChat?.id || "");

  const handleSendMessage = async () => {
    console.log('🎯 Send button clicked:', { messageText, activeChat, isSending });
    console.log('🎯 User ID:', user.id);
    console.log('🎯 Active Chat ID:', activeChat?.id);
    
    if (!messageText.trim() || !activeChat || isSending) {
      console.log('❌ Cannot send message:', { hasText: !!messageText.trim(), hasChat: !!activeChat, isSending });
      return;
    }

    setIsSending(true);
    try {
      console.log('📤 Calling sendMessage with:', messageText.trim());
      await sendMessage(messageText.trim());
      setMessageText(""); // Clear input after successful send
      console.log("✅ Message sent successfully!");
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to send message: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Wrapper>
      <IconsWrapper>
        <AttachButton onClick={() => setShowIcons(!showIcons)}>
          <Icon id="attach" className="icon" />
        </AttachButton>
        <ButtonsContainer>
          {attachButtons.map((btn) => (
            <Button showIcon={showIcons} key={btn.label}>
              <Icon id={btn.icon} />
            </Button>
          ))}
        </ButtonsContainer>
      </IconsWrapper>
      <Input 
        placeholder={
          !activeChat 
            ? "Select a chat to send messages"
            : isSending
              ? "Sending message..."
              : "Type a message here .."
        }
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={!activeChat || isSending}
      />
      <SendMessageButton 
        onClick={handleSendMessage}
        disabled={!messageText.trim() || !activeChat || isSending}
        style={{
          opacity: (!messageText.trim() || !activeChat || isSending) ? 0.5 : 1,
          cursor: (!messageText.trim() || !activeChat || isSending) ? 'not-allowed' : 'pointer'
        }}
      >
        <Icon id={isSending ? "loading" : "send"} className="icon" />
      </SendMessageButton>
    </Wrapper>
  );
}
