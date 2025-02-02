import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { AccountSettings } from './AccountSettings';

export function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { user, setUser } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const values = { username: email, password: password };
        console.log("fjdskafkldsaj")
        try {
            const response = await Api.instance.post(`${API_BASE}/general/user/authenticate`, values, { withCredentials: true });
            if (response.data && response.data.user_id) {
                setUser(response.data.user_id);
                CometChatUIKit.getLoggedinUser().then((user) => {
                    if (!user) {
                        const cometChatLogin = email.replace(/[@.]/g, '');
                        CometChatUIKit.login(cometChatLogin).then((user) => {
                            console.log("Login Successful:", { user });
                        }).catch((error) => {
                            console.error("CometChat login failed:", error);
                            setError("Incorrect username/password");
                        });
                    }
                });
                window.location.reload();
            } else {
                setError("Incorrect username/password");
            }
        } catch (error) {
            console.error('Login request failed:', error);
            setError("Incorrect username/password");
        }
    };

    if (user) {
        return <AccountSettings user={user}/>;
    }

    return (
        <Container my={40}>
            <Paper padding="md">
                <Title order={2} align="center" mb="lg">Sign in</Title>
                <Text align="center" size="sm" mb="lg">Please enter your email and password to sign in.</Text>
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
                        {error && <Text color="red" size="sm" style={{ marginBottom: '10px', textAlign: 'center' }}>{error}</Text>}
                </Container>
                <Container style={{ textAlign: 'center' }}>
                <Button type="submit" variant="filled" color="blue" style={{ width: "150px" }}>
                            Login
                        </Button>
                        <div style={{ marginTop: '20px' }}>
                            Don't have an account? <Link to="/sign-up">Sign Up</Link>
                        </div>
                    </Container>
                </form>
            </Paper>
        </Container>
    );
}
