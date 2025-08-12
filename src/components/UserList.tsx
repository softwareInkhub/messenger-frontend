import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// User interface for the list
interface User {
  uid: string;
  username: string;
  phoneNumber: string;
  createdAt: Timestamp;
  displayName?: string;
  photoURL?: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!db) {
      setError('Firestore not initialized');
      setLoading(false);
      return;
    }

    // Create a query to get all users ordered by creation date
    let usersQuery;
    try {
      usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
    } catch (error) {
      console.warn('⚠️ OrderBy query failed, using simple collection query:', error);
      // Fallback to simple collection query if orderBy fails
      usersQuery = query(collection(db, 'users'));
    }

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const userList: User[] = [];
        console.log('🔍 Fetched users from Firestore:', snapshot.size);
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const user: User = {
            uid: doc.id,
            username: data.username || 'Unknown',
            phoneNumber: data.phoneNumber || 'No phone',
            createdAt: data.createdAt || Timestamp.now(),
            displayName: data.displayName,
            photoURL: data.photoURL,
          };
          
          // Skip the current user
          if (currentUser && user.uid === currentUser.uid) {
            console.log('🚫 Skipping current user:', user.username);
            return;
          }
          
          userList.push(user);
        });
        
        console.log('✅ Filtered users (excluding current user):', userList.length);
        console.log('👥 Users to display:', userList.map(u => u.username));
        
        setUsers(userList);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Format date for display
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove the email suffix if present (from phone-to-email conversion)
    const cleanPhone = phone.replace(/@.*$/, '');
    return cleanPhone;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Debug Info */}
      {currentUser && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
          <p className="text-xs text-blue-600">
            🔍 Debug: Current user - {currentUser.displayName || currentUser.phoneNumber} (UID: {currentUser.uid.slice(0, 8)}...)
          </p>
        </div>
      )}
      
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registered Users</h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time list of all users who have signed up ({users.length} users)
              {currentUser && <span className="text-blue-600"> • Excluding current user</span>}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signup Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Users will appear here once they sign up</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.photoURL ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.photoURL}
                            alt={user.displayName || user.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {(user.displayName || user.username).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || 'No display name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.uid.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      @{user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatPhoneNumber(user.phoneNumber)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.createdAt.toDate().toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {users.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()} • 
            Real-time updates enabled
          </p>
        </div>
      )}
    </div>
  );
};

export default UserList;
