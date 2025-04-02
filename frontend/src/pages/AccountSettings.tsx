import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Title, Text, Card, Button, Divider, Stack,
  Modal, Group, TextInput, Textarea, Avatar
} from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/UserTypes';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [yourEvents, setYourEvents] = useState<Event[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [firstName, setFirstName] = useState(user.first_name ?? "");
  const [lastName, setLastName] = useState(user.last_name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [newPic, setNewPic] = useState<File | null>(null);

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

  const handleUpdate = async () => {
    const formData = new FormData();
  
    if (firstName !== undefined) formData.append("first_name", firstName);
    if (lastName !== undefined) formData.append("last_name", lastName);
    if (bio !== undefined) formData.append("bio", bio);
    if (newPic) formData.append("profile_pic", newPic);
  
    for (const [key, value] of formData.entries()) {
      console.log(`FormData -> ${key}:`, value);
    }
  
    try {
      const response = await fetch(`${API_BASE}/general/user/update`, {
        method: "POST",
        body: formData,
        credentials: "include", // replaces withCredentials
      });
  
      const data = await response.json();
      console.log("Update response:", data);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };
  
  

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
            <Group>
              <Avatar
                src={user.profile_pic || "/default-avatar.jpg"}
                alt="Profile Picture"
                size="xl"
              />
              <Stack>
                <Text size="lg"><strong>Name:</strong> {user.first_name} {user.last_name}</Text>
                <Text size="lg"><strong>Bio:</strong> {user.bio || '—'}</Text>
                <Text size="lg"><strong>Traveler:</strong> {user.is_traveler ? 'Yes' : 'No'}</Text>
                <Text size="lg"><strong>Host:</strong> {user.is_host ? 'Yes' : 'No'}</Text>
              </Stack>
            </Group>
            <Button onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
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

        <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Profile">
          <TextInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} />
          <TextInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} />
          <Stack gap="xs">
            <Text size="sm" fw={500}>Upload Profile Picture</Text>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPic(e.target.files?.[0] ?? null)}
            />
            {newPic && (
              <Text size="xs" c="dimmed">
                Selected: {newPic.name}
              </Text>
            )}
          </Stack>
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.currentTarget.value)} minRows={3} />
          <Button onClick={handleUpdate} mt="md">Save Changes</Button>
        </Modal>
      </Paper>
    </Container>
  );
}
