'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { createBrowserClient } from '@supabase/ssr';

interface AdminUser {
  user_id: string;
  email: string;
  role: string;
  user_created_at: string;
  role_created_at: string;
}

export default function AdminRolesPage() {
  const supabase = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;
  
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      if (!supabase) {
        setError('Supabase client not available');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('role_created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin users:', error);
        setError(`Database error: ${error.message}`);
        setAdminUsers([]);
      } else {
        setAdminUsers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setAdminUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const addAdminRole = async (email: string) => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsAdding(true);
    try {
      if (!supabase) {
        alert('Supabase client not available');
        return;
      }

      // Call the grant_admin_by_email function
      const { data, error } = await supabase.rpc('grant_admin_by_email', {
        user_email: email.trim()
      });

      if (error) {
        console.error('Error granting admin role:', error);
        alert(`Error: ${error.message}`);
      } else if (data) {
        alert('Admin role granted successfully!');
        setNewAdminEmail('');
        fetchAdminUsers(); // Refresh the list
      } else {
        alert('User not found or role already exists');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  const revokeAdminRole = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke admin role from ${email}?`)) {
      return;
    }

    try {
      if (!supabase) {
        alert('Supabase client not available');
        return;
      }

      // Call the revoke_admin_by_email function
      const { data, error } = await supabase.rpc('revoke_admin_by_email', {
        user_email: email
      });

      if (error) {
        console.error('Error revoking admin role:', error);
        alert(`Error: ${error.message}`);
      } else if (data) {
        alert('Admin role revoked successfully!');
        fetchAdminUsers(); // Refresh the list
      } else {
        alert('User not found or role does not exist');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Roles - AdTopia</title>
        <meta name="description" content="Manage admin roles and permissions" />
      </Head>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Roles</h1>
          <div className="text-sm text-gray-500">
            {adminUsers.length} {adminUsers.length === 1 ? 'admin' : 'admins'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Admin Form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Admin Role</h2>
          <div className="flex space-x-4">
            <input
              type="email"
              placeholder="Enter email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => addAdminRole(newAdminEmail)}
              disabled={isAdding || !newAdminEmail.trim()}
              className={`px-4 py-2 rounded-md font-medium ${
                isAdding || !newAdminEmail.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAdding ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            The user must exist in the system before granting admin role.
          </p>
        </div>

        {/* Admin Users List */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Admins</h2>
          </div>
          
          {adminUsers.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No admin users found</p>
              <p className="text-gray-500">Add an admin user using the form above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {adminUsers.map((admin) => (
                <div key={admin.user_id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{admin.email}</h3>
                          <p className="text-sm text-gray-500">
                            User ID: {admin.user_id}
                          </p>
                          <p className="text-xs text-gray-400">
                            Role granted: {new Date(admin.role_created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {admin.role.toUpperCase()}
                      </span>
                      
                      <button
                        onClick={() => revokeAdminRole(admin.email)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Admin Role Management
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Add Admin:</strong> Enter email address and click "Add Admin"</li>
            <li>• <strong>User Must Exist:</strong> The user must be registered in the system first</li>
            <li>• <strong>Revoke Admin:</strong> Click "Revoke" to remove admin privileges</li>
            <li>• <strong>UUID-based:</strong> All roles are managed using secure UUIDs</li>
            <li>• <strong>Real-time:</strong> Changes take effect immediately</li>
          </ul>
        </div>

        {/* SQL Commands */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🔧 SQL Commands for Manual Management
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Find all users:</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Grant admin by email:</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`SELECT grant_admin_by_email('user@example.com');`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Revoke admin by email:</h4>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`SELECT revoke_admin_by_email('user@example.com');`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
