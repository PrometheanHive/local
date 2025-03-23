import React, { useState, useEffect } from 'react';
import { Container, Paper, Title, Text, Card, Button, Divider, Stack } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
//import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  email: string;
}

interface Booking {
  id: number;
  event_title: string;
  event_date: string;
}

interface AccountSettingsProps {
  user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const navigate = useNavigate();

  // Ensure user data is initialized properly
  const [name, setName] = useState<string>(user?.username || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Update state when user prop changes
  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await Api.instance.get<Booking[]>(`${API_BASE}/general/user/bookings`, { withCredentials: true });
        setBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };
    fetchBookings();
  }, []);

  const handleLogout = async () => {
    try {
      await Api.instance.post(`${API_BASE}/general/user/logout`, {}, { withCredentials: true });
      //await CometChatUIKit.logout();
      console.log("Logout successful");

      window.location.href = '/'; // Refresh and redirect to homepage
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Container my={40}>
      <Paper p="md">
        <Title order={1} mb="lg">Profile</Title>

        {/*  Account Details */}
        <Card shadow="sm" p="lg">
          <Stack gap="sm">
            <Title order={2}>Account details</Title>
            <Text size="lg"><strong>Name:</strong> {name}</Text>
            <Text size="lg"><strong>Email:</strong> {email}</Text>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/*  User Bookings */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Your Bookings</Title>
            {bookings.length > 0 ? (
              bookings.map((booking: Booking) => (
                <Text key={booking.id}>
                  <strong>{booking.event_title}</strong> - {new Date(booking.event_date).toLocaleDateString()} at {new Date(booking.event_date).toLocaleTimeString([], { timeStyle: 'short' })}
                </Text>
              ))
            ) : (
              <Text c="dimmed">No bookings found.</Text>
            )}
          </Stack>
        </Card>

        <Divider my="lg" />

        {/*  Payment Methods */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Payment methods</Title>
            <Button variant="filled" color="black" style={{ width: "200px" }}>
              Add payment method
            </Button>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Logout Button */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Button onClick={handleLogout} color="red">Logout</Button>
          </Stack>
        </Card>
      </Paper>
    </Container>
  );
}
