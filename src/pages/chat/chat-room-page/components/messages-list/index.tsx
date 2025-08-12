import { forwardRef } from "react";
import { useParams } from "react-router-dom";

import Icon from "common/components/icons";
import useScrollToBottom from "./hooks/useScrollToBottom";
import { Message } from "./data/get-messages";
import { useMessaging } from "../../../hooks/useMessaging";
import { useChatContext } from "../../../context/chat";
import {
  ChatMessage,
  ChatMessageFiller,
  ChatMessageFooter,
  Container,
  Date,
  DateWrapper,
  EncryptionMessage,
  MessageGroup,
} from "./styles";

type MessagesListProps = {
  onShowBottomIcon: Function;
  shouldScrollToBottom?: boolean;
};

export default function MessagesList(props: MessagesListProps) {
  const { onShowBottomIcon, shouldScrollToBottom } = props;

  const params = useParams();
  const { user, activeChat } = useChatContext();
  
  // Use real messaging hook instead of static data
  const { messages, isLoading, error, isConnected } = useMessaging(
    user.id, 
    activeChat?.id || ""
  );

  const { containerRef, lastMessageRef } = useScrollToBottom(
    onShowBottomIcon,
    shouldScrollToBottom,
    params.id
  );

  return (
    <Container ref={containerRef}>
      <EncryptionMessage>
        <Icon id="lock" className="icon" />
        Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read
        or listen to them. Click to learn more.
      </EncryptionMessage>
      
      {/* Error State */}
      {error && (
        <DateWrapper>
          <Date style={{color: '#ff4444'}}>❌ Error: {error}</Date>
        </DateWrapper>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <DateWrapper>
          <Date>⏳ Loading messages...</Date>
        </DateWrapper>
      )}
      
      <DateWrapper>
        <Date> TODAY </Date>
      </DateWrapper>
      
      <MessageGroup>
        {messages.length === 0 && !isLoading ? (
          <DateWrapper>
            <Date>No messages yet. Start the conversation!</Date>
          </DateWrapper>
        ) : (
          messages.map((message, i) => {
            if (i === messages.length - 1) {
              return <SingleMessage key={message.id} message={message} ref={lastMessageRef} />;
            } else {
              return <SingleMessage key={message.id} message={message} />;
            }
          })
        )}
      </MessageGroup>
    </Container>
  );
}

const SingleMessage = forwardRef((props: { message: Message }, ref: any) => {
  const { message } = props;

  return (
    <ChatMessage
      key={message.id}
      className={message.isOpponent ? "chat__msg--received" : "chat__msg--sent"}
      ref={ref}
    >
      <span>{message.body}</span>
      <ChatMessageFiller />
      <ChatMessageFooter>
        <span>{message.timestamp}</span>
        {!message.isOpponent && (
          <Icon
            id={`${message.messageStatus === "SENT" ? "singleTick" : "doubleTick"}`}
            className={`chat__msg-status-icon ${
              message.messageStatus === "READ" ? "chat__msg-status-icon--blue" : ""
            }`}
          />
        )}
      </ChatMessageFooter>
    </ChatMessage>
  );
});
