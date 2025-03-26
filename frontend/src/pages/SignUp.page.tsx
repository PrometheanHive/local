import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, RadioGroup, Radio } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

//import { CometChat } from "@cometchat/chat-sdk-javascript"; // Import SDK package
//import { CometChatUIKit } from "@cometchat/chat-uikit-react"; // Import UI Kit package

export function SignUp() {
    const [email, setEmail] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<string>("");
    
    const navigate = useNavigate();
    const auth = useAuth();
    const setUser = auth?.setUser || (() => {});


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const values = { 
            email: email, 
            username: email, 
            first_name: firstName, 
            last_name: lastName, 
            password: password 
        };
    
        try {
            // Create user
            await Api.instance.post(`${API_BASE}/general/user/create`, values, {
                withCredentials: true
            });
    
            // Login user immediately after
            const loginResponse = await Api.instance.post(`${API_BASE}/general/user/authenticate`, {
                username: email,
                password: password
            }, {
                withCredentials: true
            });
    
            if (loginResponse.data && loginResponse.data.user_id) {
                setUser(loginResponse.data.user_id);
                // const cometChatLogin = email.replace(/[@.]/g, '');
                // const user = new CometChat.User(cometChatLogin);
                // user.setName(`${firstName} ${lastName}`);
    
                // await CometChatUIKit.createUser(user).catch(console.warn); // tolerate if already exists
    
                // await CometChatUIKit.login(cometChatLogin);
    
                // 🎯 Redirect to homepage
                window.location.href = '/';
            }
    
        } catch (error) {
            console.error("Signup or login failed:", error);
        }
    };
    

    return (
        <Container my={40}>
            <Paper p="md">
                <Title order={2} mb="lg">Sign Up</Title>
                <Text size="sm" mb="lg">Please enter your information to sign up.</Text>
                <form onSubmit={handleSubmit}>
                    <Container style={{ textAlign: 'center' }}>
                        <TextInput
                            label="First Name"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            style={{ width: "500px", display: 'inline-block', textAlign: 'left' }}
                            required
                        />
                    </Container>
                    <Container style={{ textAlign: 'center' }}>
                        <TextInput
                            label="Last Name"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            style={{ width: "500px", display: 'inline-block', textAlign: 'left' }}
                            required
                        />
                    </Container>
                    <Container style={{ textAlign: 'center' }}>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            style={{ width: "500px", display: 'inline-block', textAlign: 'left' }}
                            required
                        />
                    </Container>
                    <Container style={{ textAlign: 'center' }}>
                        <PasswordInput
                            style={{ marginTop: 20, width: "500px", display: 'inline-block', textAlign: 'left' }}
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </Container>
                    <Container style={{ textAlign: 'center' }}>
                        <RadioGroup
                            label="I want to sign up as"
                            value={role}
                            onChange={setRole}
                            required
                            style={{ justifyContent: 'center', display: 'flex', flexDirection: 'row', gap: '20px' }}
                        >
                            <Radio value="traveler" label="Traveler" />
                            <Radio value="host" label="Host" />
                            <Radio value="both" label="Both" />
                        </RadioGroup>
                    </Container>
                    <Container style={{ textAlign: 'center', marginTop: 20 }}>
                        <Button type="submit" variant="filled" color="blue" style={{ width: "150px" }}>
                            Sign Up
                        </Button>
                        <Text size="sm" mt="sm">
                            Already have an account? <Link to="/sign-in">Log In</Link>
                        </Text>
                    </Container>
                </form>
            </Paper>
        </Container>
    );
}
