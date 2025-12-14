import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import styles from './auth.module.scss';
import { useAuth } from '../context/auth';
import { useLoginMutation, useRegisterMutation } from '../hooks/useAuthQueries';
import { LoginInput } from '../api/types/auth/login.input';
import { LoginResponse } from '../api/types/auth/login.response';

const Auth: React.FC = () => {
  const [currentLogin, setCurrentLogin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const handleSuccess = (data: LoginResponse) => {
    console.group('Auth Component: Success Handler');

    if (data.accessToken) {
      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
      });

      navigate('/admin');
    } else {
      console.error('ERROR: No accessToken in response!', data);
      setError('Login failed: No access token received from server.');
    }
    console.groupEnd();
  };

  const handleError = (err: unknown, action: 'Login' | 'Registration') => {
    console.error(`Auth Component: ${action} error:`, err);
    const axiosError = err as AxiosError<{ message: string }>;
    if (axiosError.response && axiosError.response.data) {
      setError(
        `${action} failed: ${
          axiosError.response.data.message || 'Bad request'
        } (Status: ${axiosError.response.status})`
      );
    } else {
      setError(`${action} failed: An unexpected error occurred.`);
    }
  };

  const handleAuthAction = async () => {
    setError(null);
    const input: LoginInput = {
      login: currentLogin,
      password: currentPassword,
    };

    try {
      if (isRegister) {
        const data = await registerMutation.mutateAsync(input);
        handleSuccess(data);
      } else {
        const data = await loginMutation.mutateAsync(input);
        handleSuccess(data);
      }
    } catch (err) {
      const action = isRegister ? 'Registration' : 'Login';
      handleError(err, action);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleAuthAction();
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className={styles.auth}>
      <form onSubmit={onSubmit}>
        <h1>{isRegister ? 'Register' : 'Login'}</h1>

        <div>
          <input
            type="text"
            placeholder="Login"
            name="username"
            autoComplete="username"
            value={currentLogin}
            onChange={(e) => setCurrentLogin(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            name="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          {isLoading ? (
            <h4 className={styles.processingText}>Processing...</h4>
          ) : (
            <>
              <button type="submit" disabled={isLoading}>
                {isRegister ? 'Register' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                disabled={isLoading}
              >
                {isRegister ? 'Switch to Login' : 'Switch to Register'}
              </button>
            </>
          )}
        </div>

        <div>{error && <p style={{ color: 'red' }}>{error}</p>}</div>
      </form>
    </div>
  );
};

export default Auth;
