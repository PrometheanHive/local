import React, { useState, useEffect } from 'react';
import { Container, Paper, Title, Text, Card, Button, Divider, Stack, Modal, Group } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
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

interface Event {
  id: number;
  title: string;
  number_of_bookings: number;
}

interface AccountSettingsProps {
  user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const navigate = useNavigate();

  const [name, setName] = useState<string>(user?.username || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [yourEvents, setYourEvents] = useState<Event[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

    const fetchYourEvents = async () => {
      try {
        const res = await Api.instance.get<Event[]>(`${API_BASE}/general/user/hosted_events`, { withCredentials: true });
        setYourEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookings();
    fetchYourEvents();
  }, []);

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await Api.instance.delete(`${API_BASE}/general/event/delete/${eventId}`, { withCredentials: true });
      setYourEvents((prev) => prev.filter(e => e.id !== eventId));
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      await Api.instance.delete(`${API_BASE}/general/booking/delete/${bookingId}`, {
        withCredentials: true,
      });
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await Api.instance.post(`${API_BASE}/general/user/logout`, {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Container my={40}>
      <Paper p="md">
        <Title order={1} mb="lg">Profile</Title>

        {/* Account Details */}
        <Card shadow="sm" p="lg">
          <Stack gap="sm">
            <Title order={2}>Account details</Title>
            <Text size="lg"><strong>Name:</strong> {name}</Text>
            <Text size="lg"><strong>Email:</strong> {email}</Text>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* User Bookings */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Your Bookings</Title>
            {bookings.length > 0 ? (
              bookings.map((booking: Booking) => (
                <Group key={booking.id} justify="space-between">
                  <Text>
                    <strong>{booking.event_title}</strong> – {new Date(booking.event_date).toLocaleDateString()}
                  </Text>
                  <Button
                    color="red"
                    size="xs"
                    onClick={() => handleDeleteBooking(booking.id)}
                  >
                    Cancel
                  </Button>
                </Group>
              ))
            ) : (
              <Text c="dimmed">No bookings found.</Text>
            )}
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Hosted Events */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Your Events</Title>
            {yourEvents.map(event => (
              <Card key={event.id} shadow="xs" p="md">
                <Text><strong>{event.title}</strong> - {event.number_of_bookings} bookings</Text>
                <Button color="red" size="xs" onClick={() => { setSelectedEvent(event); setDeleteModalOpen(true); }}>Delete</Button>
              </Card>
            ))}
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Payment Methods */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Payment methods</Title>
            <Button disabled variant="filled" color="black" style={{ width: "200px" }}>
              Add payment method
            </Button>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Logout */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Button onClick={handleLogout} color="red">Logout</Button>
          </Stack>
        </Card>

        <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
          <Text>Are you sure you want to delete "{selectedEvent?.title}"?</Text>
          <Button color="red" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>Yes, Delete</Button>
        </Modal>
      </Paper>
    </Container>
  );
}
