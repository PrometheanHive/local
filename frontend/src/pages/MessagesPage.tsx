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
import { CometChatMessages } from "@cometchat/chat-uikit-react";

export function MessagesPage() {
  const { user, isLoading } = useAuth(); // ✅ now correctly inside the component

  const [allowedUsers, setAllowedUsers] = useState<CometChat.User[]>([]);
  const [activeUser, setActiveUser] = useState<CometChat.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Handle AuthProvider still loading
  if (isLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  // ✅ User not authenticated
  if (!user) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text c="red">You must be logged in to access messages.</Text>
      </Center>
    );
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const cometChatUID = user.email.replace(/[@.]/g, '');
        const current = await CometChat.getLoggedinUser();
        if (!current) {
          await CometChat.login(cometChatUID);
        }

        const response = await Api.instance.get<string[]>(
          `${API_BASE}/general/messaging/allowed-uids`,
          { withCredentials: true }
        );
        const allowedUIDs = response.data;

        const usersRequest = new CometChat.UsersRequestBuilder()
          .setUIDs(allowedUIDs)
          .setLimit(50)
          .build();

        const fetchedUsers = await usersRequest.fetchNext();
        setAllowedUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to load messages page:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user]);

  if (error) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text c="red">{error}</Text>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
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
                  <Text fw={500}>
                    {user.getName()}
                  </Text>
                </Group>
              </Card>
            ))
          )}
        </>
      ) : (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>Chatting with {activeUser.getName()}</Title>
            <Button variant="light" onClick={() => setActiveUser(null)}>Back to list</Button>
          </Group>

          <CometChatMessages user={activeUser} />
        </>
      )}
    </Container>
  );
}
