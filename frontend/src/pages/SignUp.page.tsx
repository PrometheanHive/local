// SignUp.page.tsx (Full Updated with Google OAuth and CometChat)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Title, Text, TextInput, PasswordInput,
  Button, RadioGroup, Radio, Divider
} from '@mantine/core';
import { GoogleLogin } from '@react-oauth/google';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { createUserFromEmail, loginUserByEmail } from '@/services/cometchatService';

export function SignUp() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  //const navigate = useNavigate();
  const auth = useAuth();
  const setUser = auth?.setUser || (() => {});

  const handleGoogleSignup = async (credentialResponse: any) => {
    try {
      const response = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
        provider: "google",
        token: credentialResponse.credential
      }, { withCredentials: true });

      if (response.data?.user) {
        // const newUser = response.data.user;
        // setUser(newUser);
        // await initializeCometChat();
        // const cometChatLogin = email.replace(/[@.]/g, '');
        // const chatUser = new CometChat.User(cometChatLogin);
        // chatUser.setName(`${firstName} ${lastName}`);

        // CometChatUIKit.createUser(chatUser).then(() => {
        //   console.log("✅ CometChat user created");

        //   CometChatUIKit.login(cometChatLogin)
        //     .then((ccUser) => {
        //       console.log("✅ CometChat login successful", ccUser);
        //       window.location.href = '/'; // Safe to navigate now
        //     })
        //     .catch((err) => {
        //       console.error("❌ CometChat login failed", err);
        //     });

        // }).catch((err) => {
        //   if (err?.code === 'ERR_UID_ALREADY_EXISTS') {
        //     console.warn("⚠️ CometChat user already exists, logging in instead");

        //     CometChatUIKit.login(cometChatLogin)
        //       .then((ccUser) => {
        //         console.log("✅ CometChat login successful (existing user)", ccUser);
        //         window.location.href = '/';
        //       })
        //       .catch((loginErr) => {
        //         console.error("❌ CometChat login failed (existing user)", loginErr);
        //       });

        //   } else {
        //     console.error("❌ CometChat user creation failed", err);
        //   }
        // });
      }
    } catch (err) {
      console.error("Google sign-up failed", err);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", email);
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
        username: email,
        password: password
      }, {
        withCredentials: true
      });

      await createUserFromEmail(email, firstName);
      await loginUserByEmail(email);

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
        <Text size="sm" mt="sm">
          Already have an account? <Link to="/sign-in">Log In</Link>
        </Text>
      </Paper>
    </Container>
  );
}
