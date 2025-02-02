import React, { useState } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Container, Paper, Title, Text, getContrastColor, TextInput, PasswordInput, Button, RadioGroup, Radio  } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";//import sdk package
import { CometChatUIKit } from "@cometchat/chat-uikit-react";//import uikit package


export function SignUp() {

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        //Stop browser refresh on submit for debugging
        event.preventDefault()
        const values = {email: email, username:email, first_name:firstName, last_name:lastName, password: password}
        const response = await Api.instance.post(`${API_BASE}/general/user/create`, values);
        const cometChatLogin = email.replace(/[@.]/g, '');
        var user = new CometChat.User(cometChatLogin);
        user.setName(`${firstName} ${lastName}`);
        CometChatUIKit.createUser(user).then((user:CometChat.User) => {
            console.log("user created", user);
            CometChatUIKit.login(cometChatLogin).then((user:CometChat.User) => {
               console.log("Login Successful:", { user });
            }).catch(console.log);
        }).catch(console.log);
        navigate("/sign-in");
    }


    return (

        <Container my={40}>
            <Paper padding="md">
                <Title order={2} align="center" mb="lg">Sign Up</Title>
                <Text align="center" size="sm" mb="lg"> Please enter your information to sign up.</Text>
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
                            style={{ justifyContent: 'center', display: 'flex', flexDirection: 'row', gap: '20px' }} // Adjust styling as necessary
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
                        <div>
                            Already have an account? <Link to="/sign-in">Log In</Link>
                        </div>
                    </Container>
                </form>
            </Paper>
        </Container>
    );
}