import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminService, AdminDashboardStats, UserDetail } from '../services/adminService';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Check if user is admin
  if (!user || (!user.is_admin && !user.is_super_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have admin permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardStats, allUsers] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers({ limit: 100 })
      ]);
      setStats(dashboardStats);
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadDashboardData();
      return;
    }
    try {
      setLoading(true);
      const results = await adminService.getUsers({ 
        search: searchQuery,
        limit: 100
      });
      setUsers(results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePremium = async (userId: number) => {
    try {
      await adminService.togglePremium(userId);
      await loadDashboardData();
    } catch (err: any) {
      alert('Failed to toggle premium: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleResetUsage = async (userId: number) => {
    if (confirm('Reset this user\'s API usage?')) {
      try {
        await adminService.resetUserUsage(userId);
        await loadDashboardData();
      } catch (err: any) {
        alert('Failed to reset usage: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleViewUser = async (userId: number) => {
    try {
      const userDetails = await adminService.getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (err: any) {
      alert('Failed to load user details: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatUsageLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage users, monitor system health, and view analytics</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">
              <span className="font-semibold">{user.is_super_admin ? 'Super Admin' : 'Admin'}</span>
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.total_users.toLocaleString() || 0}</dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      {stats?.active_users} active • {stats?.verified_users} verified
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Users */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-yellow-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Premium Users</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.premium_users.toLocaleString() || 0}</dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      {stats && Math.round((stats.premium_users / stats.total_users) * 100)}% of total
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Analyses */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-purple-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Analyses</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.total_analyses.toLocaleString() || 0}</dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      {stats?.analyses_today} today
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* API Calls */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-green-500">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total API Calls</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.total_api_calls.toLocaleString() || 0}</dd>
                    <dd className="text-xs text-gray-500 mt-1">
                      Platform-wide usage
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-700">{stats?.subscription_breakdown.free || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Free Tier</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats && Math.round((stats.subscription_breakdown.free / stats.total_users) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-700">{stats?.subscription_breakdown.pro || 0}</div>
              <div className="text-sm text-blue-600 mt-1">Pro Tier</div>
              <div className="text-xs text-blue-400 mt-1">
                {stats && Math.round((stats.subscription_breakdown.pro / stats.total_users) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-700">{stats?.subscription_breakdown.enterprise || 0}</div>
              <div className="text-sm text-purple-600 mt-1">Enterprise</div>
              <div className="text-xs text-purple-400 mt-1">
                {stats && Math.round((stats.subscription_breakdown.enterprise / stats.total_users) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); loadDashboardData(); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">👥</div>
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analyses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {userItem.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                              <span>{userItem.full_name}</span>
                              {userItem.is_super_admin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Super Admin</span>}
                              {userItem.is_admin && !userItem.is_super_admin && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Admin</span>}
                            </div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.subscription_tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                          userItem.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userItem.subscription_tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {userItem.is_active && <span className="text-xs text-green-600">● Active</span>}
                          {!userItem.is_active && <span className="text-xs text-red-600">● Inactive</span>}
                          {userItem.is_premium && <span className="text-xs text-yellow-600">⭐ Premium</span>}
                          {userItem.is_email_verified && <span className="text-xs text-blue-600">✓ Verified</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {userItem.api_calls_used.toLocaleString()} / {formatUsageLimit(userItem.api_calls_limit)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${userItem.api_calls_limit === -1 ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: userItem.api_calls_limit === -1 ? '100%' : `${Math.min((userItem.api_calls_used / userItem.api_calls_limit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem.total_analyses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewUser(userItem.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {user.is_super_admin && (
                          <>
                            <button
                              onClick={() => handleTogglePremium(userItem.id)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              {userItem.is_premium ? 'Remove Premium' : 'Make Premium'}
                            </button>
                            <button
                              onClick={() => handleResetUsage(userItem.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Reset Usage
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-gray-900">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subscription Tier</label>
                    <p className="text-gray-900 capitalize">{selectedUser.subscription_tier}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-gray-900">{selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">API Calls Used</label>
                    <p className="text-gray-900">{selectedUser.api_calls_used.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">API Calls Limit</label>
                    <p className="text-gray-900">{formatUsageLimit(selectedUser.api_calls_limit)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Analyses</label>
                    <p className="text-gray-900">{selectedUser.total_analyses}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedUser.is_active && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>}
                  {selectedUser.is_premium && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Premium</span>}
                  {selectedUser.is_email_verified && <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Verified</span>}
                  {selectedUser.is_admin && <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Admin</span>}
                  {selectedUser.is_super_admin && <span className="px-3 py-1 bg-purple-200 text-purple-900 text-sm rounded-full font-bold">Super Admin</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;