import React, { useEffect, useState } from 'react';

import { CometChat } from "@cometchat/chat-sdk-javascript";
import {
  Container,
  Card,
  Text,
  Avatar,
  Title,
  Group,
  Loader,
  Center,
  Button
} from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useAuth } from '../auth/AuthProvider';
import { CometChatMessages, UIKitSettingsBuilder, CometChatUIKit } from "@cometchat/chat-uikit-react";
import { loginUserByEmail, sanitizeEmailToUID } from '@/services/cometchatService';

const COMETCHAT_CONSTANTS = {
  APP_ID: import.meta.env.VITE_COMETCHAT_APP_ID,
  REGION: import.meta.env.VITE_COMETCHAT_REGION,
  AUTH_KEY: import.meta.env.VITE_COMETCHAT_AUTH_KEY,
};

export function MessagesPage() {
  const { user, isLoading } = useAuth();
  const [allowedUsers, setAllowedUsers] = useState<CometChat.User[]>([]);
  const [activeUser, setActiveUser] = useState<CometChat.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;

    const loadUsers = async () => {
      try {
        const uid = sanitizeEmailToUID(user.email);
        console.log("Printing Constants:", COMETCHAT_CONSTANTS);
        const settings = new UIKitSettingsBuilder()
          .setAppId(COMETCHAT_CONSTANTS.APP_ID)
          .setRegion(COMETCHAT_CONSTANTS.REGION)
          .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
          .subscribePresenceForAllUsers()
          .build();

        await CometChatUIKit.init(settings);
        console.log("✅ CometChat UIKit initialized inside MessagesPage");

        await loginUserByEmail(user.email);

        const response = await Api.instance.get<string[]>(
          `${API_BASE}/general/messaging/allowed-uids`,
          { withCredentials: true }
        );

        const allowedUIDs = response.data;

        if (!Array.isArray(allowedUIDs) || allowedUIDs.length === 0) {
          setAllowedUsers([]);
          setLoading(false);
          return;
        }

        const usersRequest = new CometChat.UsersRequestBuilder()
          .setUIDs(allowedUIDs)
          .setLimit(50)
          .build();

        const fetchedUsers: CometChat.User[] = await usersRequest.fetchNext();
        const visibleUsers = fetchedUsers.filter(u => u.getUid() !== uid);

        setAllowedUsers(visibleUsers);
      } catch (err) {
        console.error("❌ Failed to load messages page:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isLoading, user]);

  if (isLoading || loading) {
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

  return (
    <Container my={40}>
      {!activeUser ? (
        <>
          <Title order={2} mb="lg">Your Conversations</Title>
          {allowedUsers.length === 0 ? (
            <Text c="dimmed">You haven't started any conversations yet.</Text>
          ) : (
            allowedUsers.map((user) => (
              <Card
                key={user.getUid()}
                shadow="sm"
                withBorder
                p="md"
                mb="md"
                onClick={() => setActiveUser(user)}
                style={{ cursor: 'pointer' }}
              >
                <Group align="center">
                  <Avatar src={user.getAvatar()} radius="xl" />
                  <Text fw={500}>{user.getName()}</Text>
                </Group>
              </Card>
            ))
          )}
        </>
      ) : (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>Chatting with {activeUser.getName()}</Title>
            <Button variant="light" onClick={() => setActiveUser(null)}>
              Back to list
            </Button>
          </Group>

          <CometChatMessages user={activeUser} />
        </>
      )}
    </Container>
  );
}
