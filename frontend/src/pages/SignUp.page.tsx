import React, { useState } from 'react';
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, RadioGroup, Radio } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { Link, useNavigate } from "react-router-dom";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

export function SignUp() {
    const [email, setEmail] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const values = { email, username: email, first_name: firstName, last_name: lastName, password };

        try {
            await Api.instance.post(`${API_BASE}/general/user/create`, values);

            // Ensure CometChat is initialized before user creation
            const UIKitSettings = new UIKitSettingsBuilder()
              .setAppId("254033c3e0be6dd7")
              .setRegion("US")
              .subscribePresenceForFriends()
              .build();

            await CometChatUIKit.init(UIKitSettings);

            const cometChatUID = email.replace(/[@.]/g, '');
            const user = new CometChat.User(cometChatUID);
            user.setName(`${firstName} ${lastName}`);

            CometChatUIKit.createUser(user)
                .then(() => CometChatUIKit.login(cometChatUID))
                .then(() => {
                    console.log("✅ CometChat Login Successful");
                    navigate("/sign-in");
                })
                .catch(console.error);
        } catch (error) {
            console.error("❌ User creation failed:", error);
        }
    };

    return (
        <Container my={40}>
            <Paper p="md">
                <Title order={2} ta="center" mb="lg">Sign Up</Title>
                <Text ta="center" size="sm" mb="lg">Please enter your information to sign up.</Text>
                <form onSubmit={handleSubmit}>
                    <TextInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <TextInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" mt="md">Sign Up</Button>
                </form>
            </Paper>
        </Container>
    );
}
