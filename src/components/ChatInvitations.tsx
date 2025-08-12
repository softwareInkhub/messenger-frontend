import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getPendingInvitations, 
  acceptChatInvitation, 
  declineChatInvitation,
  ChatInvitation 
} from '../utils/chatInvitations';

const ChatInvitations: React.FC = () => {
  const [invitations, setInvitations] = useState<ChatInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = getPendingInvitations(currentUser.uid, (invitations) => {
      setInvitations(invitations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAcceptInvitation = async (invitation: ChatInvitation) => {
    try {
      setError('');
      await acceptChatInvitation(invitation.id);
      console.log('✅ Chat invitation accepted');
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
      console.error('❌ Error accepting invitation:', err);
    }
  };

  const handleDeclineInvitation = async (invitation: ChatInvitation) => {
    try {
      setError('');
      await declineChatInvitation(invitation.id);
      console.log('❌ Chat invitation declined');
    } catch (err: any) {
      setError(err.message || 'Failed to decline invitation');
      console.error('❌ Error declining invitation:', err);
    }
  };

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Unknown date';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500">Loading invitations...</span>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm font-medium text-gray-900">No pending invitations</p>
        <p className="text-xs text-gray-500 mt-1">You'll see chat invitations here when other users want to chat with you</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chat Invitations ({invitations.length})
      </h3>
      
      {invitations.map((invitation) => (
        <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {invitation.fromUserName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {invitation.fromUserName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(invitation.createdAt)}
                  </p>
                </div>
              </div>
              
              {invitation.message && (
                <p className="text-sm text-gray-600 mb-3">
                  "{invitation.message}"
                </p>
              )}
              
              <p className="text-xs text-gray-500">
                Wants to start a chat with you
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleAcceptInvitation(invitation)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => handleDeclineInvitation(invitation)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatInvitations;
