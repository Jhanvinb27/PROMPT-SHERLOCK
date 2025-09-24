import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  
  const { login, isAuthenticated, user, error } = useAuth();

  const createTestUser = async () => {
    setIsCreating(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/create-test-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      setMessage(`Test user creation: ${result.message}`);
    } catch (error) {
      setMessage(`Error creating test user: ${error}`);
    }
    
    setIsCreating(false);
  };

  const handleLogin = async () => {
    try {
      await login({ email, password });
      setMessage('Login successful!');
    } catch (error) {
      setMessage(`Login failed: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Login Test</h2>
      
      <div className="mb-4">
        <p><strong>Auth Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
        {user && <p><strong>User:</strong> {(user as any).email}</p>}
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>

      <div className="mb-4">
        <button
          onClick={createTestUser}
          disabled={isCreating}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create Test User'}
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};