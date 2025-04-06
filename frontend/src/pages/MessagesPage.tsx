import React, { useState, useEffect } from 'react';
import { CometChatUsersWithMessages, CometChatUIKit } from '@cometchat/chat-uikit-react';
import { useAuth } from '../auth/AuthProvider'; // Ensure this is correctly imported
import { Loader, Center, Text } from '@mantine/core';

export function MessagesPage() {
    const auth = useAuth(); // Get the authenticated user from context
    const user = auth?.user || null; // Ensure user is properly handled

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
                <Text c="red">{error}</Text>
            </Center>
        );
    }

    return <CometChatUsersWithMessages />;
}
