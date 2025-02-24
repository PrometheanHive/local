import React, { useState, useEffect } from 'react';
import { CometChatUsersWithMessages, CometChatUIKit } from '@cometchat/chat-uikit-react';
import { useAuth } from '../auth/AuthProvider'; // Ensure this is correctly imported
import { Loader, Center, Text } from '@mantine/core';

export function MessagesPage() {
    const { user } = useAuth(); // Get the authenticated user from your context
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setError("User is not authenticated.");
            setLoading(false);
            return;
        }

        const loginCometChat = async () => {
            try {
                const cometChatUID = user.email.replace(/[@.]/g, ''); // Ensure it matches your CometChat UID format
                await CometChatUIKit.login(cometChatUID);
                console.log("CometChat login successful.");
                setLoading(false);
            } catch (err) {
                console.error("CometChat login failed:", err);
                setError("Failed to log in to CometChat.");
                setLoading(false);
            }
        };

        loginCometChat();
    }, [user]);

    if (loading) {
        return (
            <Center style={{ height: "100vh" }}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center style={{ height: "100vh" }}>
                <Text color="red">{error}</Text>
            </Center>
        );
    }

    return <CometChatUsersWithMessages />;
}
