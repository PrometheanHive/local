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
  const auth = useAuth();
  const user = auth?.user;
  const [allowedUsers, setAllowedUsers] = useState<CometChat.User[]>([]);
  const [activeUser, setActiveUser] = useState<CometChat.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("📦 Rendered MessagesPage");
  console.log("🧠 user:", user);
  console.log("🔄 isLoading (from auth):", auth?.isLoading);

  useEffect(() => {
    console.log("📡 useEffect fired: checking user...");

    if (!user) {
      console.warn("⚠️ No user found in auth context.");
      setError("You must be logged in to access messages.");
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        const cometChatUID = user.email.replace(/[@.]/g, '');
        console.log("🆔 Calculated CometChat UID:", cometChatUID);

        const current = await CometChat.getLoggedinUser();

        if (!current || current.getUid() !== cometChatUID) {
        console.warn(`🔄 Reauthenticating as ${cometChatUID} (was: ${current?.getUid()})`);

        try {
            if (current) {
            console.log("📤 Logging out previous CometChat session...");
            await CometChat.logout(); // this might fail if session is stale
            }
        } catch (logoutError) {
            console.warn("⚠️ CometChat logout failed or not needed:", logoutError);
            // intentionally swallowing the error here
        }

        try {
            await CometChat.login(cometChatUID);
            console.log(`✅ CometChat logged in as: ${cometChatUID}`);
        } catch (loginError) {
            console.error("❌ CometChat login failed:", loginError);
            throw loginError; // Let your catch block in `loadUsers()` handle this
        }
        }


        console.log("🌐 Fetching allowed UIDs from backend...");
        const response = await Api.instance.get<string[]>(
          `${API_BASE}/general/messaging/allowed-uids`,
          { withCredentials: true }
        );

        const allowedUIDs = response.data;
        console.log("🎯 Backend returned allowed UIDs:", allowedUIDs);

        if (!Array.isArray(allowedUIDs) || allowedUIDs.length === 0) {
          console.warn("🚫 No allowed UIDs to display.");
          setAllowedUsers([]);
          setLoading(false);
          return;
        }

        console.log("📡 Fetching user info from CometChat for allowed UIDs...");
        const usersRequest = new CometChat.UsersRequestBuilder()
          .setUIDs(allowedUIDs)
          .setLimit(50)
          .build();

        const fetchedUsers: CometChat.User[] = await usersRequest.fetchNext();
        console.log("👥 Fetched users from CometChat:", fetchedUsers.map(u => u.getUid()));

        const visibleUsers = fetchedUsers.filter(u => u.getUid() !== cometChatUID);
        console.log("🙈 Filtered out self. Final users to display:", visibleUsers.map(u => u.getUid()));

        setAllowedUsers(visibleUsers);
      } catch (err) {
        console.error("❌ Failed to load messages page:", err);
        setError("Failed to load users.");
      } finally {
        console.log("✅ Finished loading");
        setLoading(false);
      }
    };

    loadUsers();
  }, [user]);

  if (error) {
    console.warn("🛑 Rendering error fallback");
    return (
      <Center style={{ height: "100vh" }}>
        <Text c="red">{error}</Text>
      </Center>
    );
  }

  if (loading) {
    console.log("⏳ Still loading...");
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  console.log("✅ Ready to render UI");
  console.log("🎈 Active user:", activeUser?.getUid());
  console.log("💬 Allowed users available:", allowedUsers.length);

  return (
    <Container my={40}>
      {!activeUser ? (
        <>
          <Title order={2} mb="lg">Your Conversations</Title>
          {allowedUsers.length === 0 ? (
            <Text c="dimmed">You haven't started any conversations yet.</Text>
          ) : (
            allowedUsers.map((user) => {
              console.log("🖱️ Rendering conversation card for:", user.getUid());
              return (
                <Card
                  key={user.getUid()}
                  shadow="sm"
                  withBorder
                  p="md"
                  mb="md"
                  onClick={() => {
                    console.log("🟢 User clicked:", user.getUid());
                    setActiveUser(user);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Group align="center">
                    <Avatar src={user.getAvatar()} radius="xl" />
                    <Text fw={500}>{user.getName()}</Text>
                  </Group>
                </Card>
              );
            })
          )}
        </>
      ) : (
        <>
          <Group justify="space-between" mb="md">
            <Title order={3}>Chatting with {activeUser.getName()}</Title>
            <Button variant="light" onClick={() => {
              console.log("🔙 Returning to list view");
              setActiveUser(null);
            }}>
              Back to list
            </Button>
          </Group>

          <CometChatMessages user={activeUser} />
        </>
      )}
    </Container>
  );
}
