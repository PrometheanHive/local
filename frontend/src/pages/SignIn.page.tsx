import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Divider } from '@mantine/core';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { AccountSettings } from './AccountSettings';
import { initializeCometChat } from "@/services/cometchatService";

export function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    
    const auth = useAuth();
    const user = auth?.user || null;
    const setUser = auth?.setUser || (() => {});

    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const response = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
                provider: "google",
                token: credentialResponse.credential
            }, { withCredentials: true });

            if (response.data?.user) {
                setUser(response.data.user);
                await initializeCometChat();
                window.location.href = '/';
            }
        } catch (err) {
            console.error("OAuth login failed", err);
            setError("Google sign-in failed");
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await Api.instance.post(`${API_BASE}/general/user/authenticate`, { username: email, password }, { withCredentials: true });
            if (response.data?.user_id) {
                const userRes = await Api.instance.get(`${API_BASE}/general/user/${response.data.user_id}`, { withCredentials: true });
                setUser(userRes.data);
                await initializeCometChat();
                window.location.href = '/';
            } else {
                setError("Incorrect username/password");
            }
        } catch (error) {
            console.error('Login failed:', error);
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
                    {error && <Text c="red" size="sm">{error}</Text>}
                    <Button type="submit" fullWidth mt="lg">Login</Button>
                </form>
                <Divider my="lg" label="or" labelPosition="center" />
                <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError("Google Sign-In failed")} />
                <Text size="sm" mt="md">
                    Don't have an account? <Link to="/sign-up">Sign Up</Link>
                </Text>
            </Paper>
        </Container>
    );
}