import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

export function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const { user, setUser } = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = { username: email, password };

        try {
            const response = await Api.instance.post(`${API_BASE}/general/user/authenticate`, values, { withCredentials: true });

            if (response.data && response.data.user_id) {
                setUser(response.data.user_id);

                // Ensure CometChat UIKit is initialized before login
                const UIKitSettings = new UIKitSettingsBuilder()
                  .setAppId("254033c3e0be6dd7")
                  .setRegion("US")
                  .subscribePresenceForFriends()
                  .build();

                await CometChatUIKit.init(UIKitSettings);

                const cometChatUID = email.replace(/[@.]/g, '');

                CometChatUIKit.getLoggedinUser().then((user) => {
                    if (!user) {
                        CometChatUIKit.login(cometChatUID).then((user) => {
                            console.log("✅ CometChat Login Successful:", user);
                            window.location.reload();
                        }).catch((error) => {
                            console.error("❌ CometChat login failed:", error);
                            setError("Incorrect username/password");
                        });
                    }
                });
            } else {
                setError("Incorrect username/password");
            }
        } catch (error) {
            console.error('❌ Login request failed:', error);
            setError("Incorrect username/password");
        }
    };

    return (
        <Container my={40}>
            <Paper p="md">
                <Title order={2} ta="center" mb="lg">Sign in</Title>
                <Text ta="center" size="sm" mb="lg">Please enter your email and password to sign in.</Text>
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                    {error && <Text c="red">{error}</Text>}
                    <Button type="submit" mt="md">Login</Button>
                </form>
                <Text ta="center" mt="md">
                    Don't have an account? <Link to="/sign-up">Sign Up</Link>
                </Text>
            </Paper>
        </Container>
    );
}
