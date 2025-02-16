import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p>Manage users and permissions.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Manage Users
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Content</h2>
          <p>Manage study materials and topics.</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Manage Content
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p>View platform analytics and insights.</p>
          <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            View Analytics
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">History</h2>
          <p>View learned cards history.</p>
          <Link to="/history">
            <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              View History
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;