import { useState } from 'react';
import { useAuth } from "../context/auth";
import { useChangeLoginMutation } from '../hooks/useProfileQueries';
import { ChangeLoginInput } from '../api/types/profile/change-login.input';

const ChangeLoginTester = () => {
  const [newLogin, setNewLogin] = useState('');
  const [status, setStatus] = useState('');
  const { mutate, isPending } = useChangeLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    const input: ChangeLoginInput = {
      newLogin,
    };

    mutate(input, {
      onSuccess: () => {
        setStatus('Success! Login changed. You may need to refresh the token to see changes.');
      },
      onError: (error) => {
        setStatus(`Error: ${error.message}`);
        console.error('Change Login Error:', error);
      },
    });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h4>Change Login Test (Profile Endpoint)</h4>
      <form onSubmit={handleSubmit}>
        <label>
          New Login:
          <input
            type="text"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
            required
            disabled={isPending}
          />
        </label>
        <button type="submit" disabled={isPending || !newLogin}>
          {isPending ? 'Changing...' : 'Change Login'}
        </button>
      </form>
      <p>Status: {status}</p>
    </div>
  );
};

export default function TestingTemp() {
  const { session, isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <div>
        <h2>Testing Context Data</h2>
      <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>

      {session && (
        <>
          <h3>User Session Data (Testing purposes):</h3>
          <pre>
            {JSON.stringify(session, null, 2)}
          </pre>
          <p>Role: {session.role}</p>
        </>
      )}

      {!isAuthenticated && !isLoading && <p>No active session found.</p>}
      </div>
      {session && <ChangeLoginTester />}
    </>
  );
}
