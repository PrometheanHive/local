import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { AccountSettings } from './AccountSettings';
import { initializeCometChat } from "@/services/cometchatService";

export function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    
    const auth = useAuth(); // Ensure auth context is properly accessed
    const user = auth?.user || null;
    const setUser = auth?.setUser || (() => {}); // Provide fallback function

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
                await initializeCometChat();

                CometChatUIKit.getLoggedinUser().then((user) => {
                    if (!user) {
                        const cometChatLogin = email.replace(/[@.]/g, '');
                        CometChatUIKit.login(cometChatLogin)
                            .then((user) => console.log("CometChat: Login Successful:", { user }))
                            .catch((error) => {
                                console.error("CometChat: login failed:", error);
                                setError("CometChat: Incorrect username/password");
                            });
                    }
                });

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

    if (user) {
        return <AccountSettings user={user} />;
    }

    return (
        <Container my={40}>
            <Paper p="md">
                <Title order={2} mb="lg">Sign in</Title>
                <Text size="sm" mb="lg">
                    Please enter your email and password to sign in.
                </Text>
                <form onSubmit={handleSubmit}>
                    <Container style={{ textAlign: 'center' }}>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            style={{ width: "500px", display: 'inline-block', textAlign: 'left' }}
                            required
                        />
                        <PasswordInput
                            style={{ marginTop: 20, width: "500px", display: 'inline-block', textAlign: 'left' }}
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        {error && (
                            <Text c="red" size="sm" mb="sm">
                                {error}
                            </Text>
                        )}
                    </Container>
                    <Container style={{ textAlign: 'center' }}>
                        <Button type="submit" variant="filled" color="blue" style={{ width: "150px" }}>
                            Login
                        </Button>
                        <Text size="sm" mt="sm">
                            <span>Don't have an account? </span>
                            <Link to="/sign-up">Sign Up</Link>
                        </Text>
                    </Container>
                    <Text size="sm" mt="sm">
                    <a href="/password-reset/">Forgot your password?</a>
                    </Text>
                </form>
            </Paper>
        </Container>
    );
}
