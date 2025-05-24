// SignIn.page.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Divider } from '@mantine/core';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { AccountSettings } from './AccountSettings';
import { loginUserByEmail } from '@/services/cometchatService';

export function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const auth = useAuth();
    const user = auth?.user || null;
    const setUser = auth?.setUser || (() => {});

    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const email = decoded.email;

            // Step 1: Check if user exists in backend DB
            const existsRes = await Api.instance.get(`${API_BASE}/general/user/exists-by-email`, {
                params: { email },
                withCredentials: true
            });

            if (!existsRes.data?.exists) {
                setError("Google account not registered. Please sign up first.");
                return;
            } else {
                // Step 2: Proceed with OAuth login
                const response = await Api.instance.post(`${API_BASE}/general/user/oauth-login`, {
                    provider: "google",
                    token: credentialResponse.credential
                }, { withCredentials: true });

                // await initializeCometChat();

                // CometChatUIKit.getLoggedinUser().then((user) => {
                //     if (!user) {
                //         const cometChatLogin = email.replace(/[@.]/g, '');
                //         CometChatUIKit.login(cometChatLogin)
                //             .then((user) => console.log("CometChat: Login Successful:", { user }))
                //             .catch((error) => {
                //                 console.error("CometChat: login failed:", error);
                //                 setError("CometChat: Incorrect username/password");
                //             });
                //     }
                // });

            }
                
            } catch (err) {
                console.error("OAuth login failed", err);
                setError("Google sign-in failed");
            }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const values = { username: email, password: password };
        console.log("Attempting login...");
    
        try {
            const response = await Api.instance.post(`${API_BASE}/general/user/authenticate`, values, { withCredentials: true });

            if (response.data && response.data.user_id) {
                try {
                    const userRes = await Api.instance.get(`${API_BASE}/general/user/${response.data.user_id}`, {
                      withCredentials: true,
                    });
                
                    const fullUser = userRes.data;
                    console.log("✅ Full user fetched after login:", fullUser);
                    setUser(fullUser); // now you’re setting the correct full object
                
                    // Optional: show a message or redirect later
                } catch (err) {
                    console.error("❌ Failed to fetch full user data after login:", err);
                    setError("Failed to complete login.");
                }
                await loginUserByEmail(email);

                // Redirect to homepage and refresh to reflect login state
                //window.location.href = '/';
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