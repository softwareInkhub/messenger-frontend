import React from 'react';
import UserList from '../components/UserList';

const UserListPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor all registered users in real-time. New users will appear instantly when they sign up.
          </p>
        </div>

        {/* User List Component */}
        <UserList />
      </div>
    </div>
  );
};

export default UserListPage;
