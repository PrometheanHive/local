import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Divider } from '@mantine/core';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { AccountSettings } from './AccountSettings';
import { loginUserByEmail } from '@/services/cometchatService';
import AppleSignin from 'react-apple-signin-auth';

export function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isGoogleError, setIsGoogleError] = useState<boolean>(false);

  const auth = useAuth();
  const user = auth?.user || null;
  const setUser = auth?.setUser || (() => {});

  const handleGoogleLogin = async (credentialResponse: any) => {
    setIsGoogleError(true);
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      const existsRes = await Api.instance.get(`${API_BASE}/general/user/exists-by-email`, {
        params: { email },
        withCredentials: true
      });

      if (!existsRes.data?.exists) {
        setError("Google account not registered. Please sign up first.");
        return;
      }

      const response = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
        provider: "google",
        token: credentialResponse.credential
      }, { withCredentials: true });

      if (response.data?.user) {
        const user = response.data.user;
        setUser(user);
        await loginUserByEmail(email);
        window.location.href = '/account-settings';
      } else {
        setError("Login failed. Please try again.");
      }

    } catch (err) {
      console.error("OAuth login failed:", err);
      setError("Google sign-in failed");
    }
  };

  const handleAppleLogin = async (response: any) => {
    setIsGoogleError(true);
    try {
      const id_token = response.authorization.id_token;
      const decoded: any = jwtDecode(id_token);
      const email = decoded.email;

      const existsRes = await Api.instance.get(`${API_BASE}/general/user/exists-by-email`, {
        params: { email },
        withCredentials: true
      });

      if (!existsRes.data?.exists) {
        setError("Apple account not registered. Please sign up first.");
        return;
      }

      const result = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
        provider: "apple",
        token: id_token
      }, { withCredentials: true });

      if (result.data?.user) {
        const user = result.data.user;
        setUser(user);
        await loginUserByEmail(email);
        window.location.href = '/account-settings';
      } else {
        setError("Login failed. Please try again.");
      }

    } catch (err) {
      console.error("Apple OAuth login failed:", err);
      setError("Apple sign-in failed");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGoogleError(false);

    try {
      const response = await Api.instance.post(`${API_BASE}/general/user/authenticate`, {
        username: email,
        password
      }, { withCredentials: true });

      if (response.data && response.data.user_id) {
        const userRes = await Api.instance.get(`${API_BASE}/general/user/${response.data.user_id}`, {
          withCredentials: true,
        });

        const fullUser = userRes.data;
        setUser(fullUser);
        await loginUserByEmail(email);
        window.location.href = '/';
      } else {
        setError("Incorrect username/password");
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setError("Incorrect username/password");
    }
  };

  if (user) return <AccountSettings user={user} />;

  return (
    <Container my={40}>
      <Paper p="md">
        <Title order={2}>Sign In</Title>
        <form onSubmit={handleSubmit}>
          <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <PasswordInput label="Password" value={password} onChange={e => setPassword(e.target.value)} required mt="md" />
          {!isGoogleError && error && (
            <Text c="red" size="sm" mt="xs">{error}</Text>
          )}
          <Button type="submit" fullWidth mt="lg">Login</Button>
        </form>

        <Divider my="lg" label="or" labelPosition="center" />

        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            setIsGoogleError(true);
            setError("Google Sign-In failed");
          }}
        />

        <AppleSignin
          authOptions={{
            clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
            scope: 'name email',
            redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI,
            state: 'state',
            usePopup: true,
          }}
          uiType="dark"
          onSuccess={handleAppleLogin}
          onError={(error: any) => {
            console.error("Apple Sign-In failed:", error);
            setError("Apple Sign-In failed");
            setIsGoogleError(true);
          }}
          render={(props: any) => (
            <Button onClick={props.onClick} fullWidth mt="sm">
              Sign in with Apple
            </Button>
          )}
        />

        {isGoogleError && error && (
          <Text c="red" size="sm" mt="xs">{error}</Text>
        )}

        <Text size="sm" mt="md">
          Don't have an account? <Link to="/sign-up">Sign Up</Link>
        </Text>
      </Paper>
    </Container>
  );
} 