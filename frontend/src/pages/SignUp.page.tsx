import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Paper, Title, Text, TextInput, PasswordInput,
  Button, RadioGroup, Radio, Divider
} from '@mantine/core';
import { GoogleLogin } from '@react-oauth/google';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { createUserFromEmail, loginUserByEmail } from '@/services/cometchatService';
import { jwtDecode } from 'jwt-decode';
import AppleSignin from 'react-apple-signin-auth';

export function SignUp() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const auth = useAuth();
  const setUser = auth?.setUser || (() => {});

  const handleGoogleSignup = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      const firstName = decoded.given_name || "";
      const lastName = decoded.family_name || "";
      const normalizedEmail = email.trim().toLowerCase();

      const response = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
        provider: "google",
        token: credentialResponse.credential
      }, { withCredentials: true });

      if (response.data?.user) {
        const user = response.data.user;
        setUser(user);

        const fullName = `${firstName} ${lastName}`.trim();
        await createUserFromEmail(email, fullName);
        await loginUserByEmail(email);

        window.location.href = '/account-settings';
      }
    } catch (err) {
      console.error("Google sign-up failed:", err);
    }
  };

  const handleAppleSignup = async (response: any) => {
    try {
      const id_token = response.authorization.id_token;
      const decoded: any = jwtDecode(id_token);
      const email = decoded.email;
      const normalizedEmail = email.trim().toLowerCase();

      const result = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
        provider: "apple",
        token: id_token
      }, { withCredentials: true });
  
      if (result.data?.user) {
        const user = result.data.user;
        setUser(user);
  
        // ✅ Use name from backend response (not decoded token)
        const fullName = `${user.first_name || 'unknown'} ${user.last_name || 'unknown'}`.trim();
        console.log('fullname: ', fullName);
        await createUserFromEmail(normalizedEmail, fullName);
        await loginUserByEmail(normalizedEmail);
  
        window.location.href = '/account-settings';
      }
    } catch (err) {
      console.error("Apple sign-up failed:", err);
    }
  };
  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
  
      const formData = new FormData();
      formData.append("email", normalizedEmail);
      formData.append("username", normalizedEmail);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("password", password);
      formData.append("bio", bio);
      formData.append("role", role);
  
      await Api.instance.post(`${API_BASE}/general/user/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const loginResponse = await Api.instance.post(`${API_BASE}/general/user/authenticate`, {
        username: normalizedEmail,
        password
      }, { withCredentials: true });
  
      const fullName = `${firstName} ${lastName}`.trim();
      await createUserFromEmail(normalizedEmail, fullName);
      await loginUserByEmail(normalizedEmail);
      window.location.href = '/account-settings';
    } catch (error) {
      console.error("Signup or login failed:", error);
    }
  };
  
  return (
    <Container my={40}>
      <Paper p="md">
        <Title order={2}>Sign Up</Title>
        <form onSubmit={handleSubmit}>
          <TextInput label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <TextInput label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required mt="sm" />
          <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} required mt="sm" />
          <PasswordInput label="Password" value={password} onChange={e => setPassword(e.target.value)} required mt="sm" />
          <TextInput label="Bio" value={bio} onChange={e => setBio(e.target.value)} mt="sm" />
          <RadioGroup label="Role" value={role} onChange={setRole} required mt="md">
            <Radio value="traveler" label="Explorer" />
            <Radio value="host" label="Creator" />
            <Radio value="both" label="Both" />
          </RadioGroup>
          <Button type="submit" fullWidth mt="lg">Sign Up</Button>
        </form>
        <Divider my="lg" label="or" labelPosition="center" />
        <GoogleLogin onSuccess={handleGoogleSignup} onError={() => console.error("Google Sign-Up failed")} />
        <AppleSignin
          authOptions={{
            clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
            scope: 'name email',
            redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI,
            state: 'state',
            usePopup: true,
          }}
          uiType="dark" // or "light" or "auto"
          onSuccess={handleAppleSignup}
          onError={(error: any) => {
            console.error("Apple Sign-Up failed:", error);
          }}
        />

        <Text size="sm" mt="sm">
          Already have an account? <Link to="/sign-in">Log In</Link>
        </Text>
      </Paper>
    </Container>
  );
}