import React, { useState, useEffect } from 'react';
import { CometChatUsersWithMessages, CometChatUIKit } from '@cometchat/chat-uikit-react';
import { useAuth } from '../auth/AuthProvider';
import { Loader, Center, Text } from '@mantine/core';
import { UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

export function MessagesPage() {
    const auth = useAuth();
    const user = auth?.user || null;

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setError("User is not authenticated.");
            setLoading(false);
            return;
        }

        const initializeAndLoginCometChat = async () => {
            try {
                const UIKitSettings = new UIKitSettingsBuilder()
                    .setAppId("254033c3e0be6dd7")
                    .setRegion("US")
                    .subscribePresenceForFriends()
                    .build();

                await CometChatUIKit.init(UIKitSettings);
                console.log("✅ CometChat Initialized");

                const cometChatUID = user.email.replace(/[@.]/g, '');
                await CometChatUIKit.login(cometChatUID);
                console.log("✅ CometChat Login Successful");

                setLoading(false);
            } catch (err) {
                console.error("❌ CometChat Initialization/Login Failed:", err);
                setError("Failed to log in to CometChat.");
                setLoading(false);
            }
        };

        initializeAndLoginCometChat();
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
