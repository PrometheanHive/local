import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Title, Text, Card, Button, Divider, Stack,
  Modal, Group, TextInput, Textarea, Avatar
} from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/UserTypes';
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useAuth } from '../auth/AuthProvider';

interface Booking {
  id: number;
  event_id: number;
  event_title: string;
  event_date: string;
}

interface Event {
  id: number;
  title: string;
  number_of_bookings: number;
  photos?: string[];
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
  const [socialLinks, setSocialLinks] = useState<{ [key: string]: string }>(user.social_links || {});
  const { setUser } = useAuth();

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

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
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("bio", bio);
    if (newPic) formData.append("profile_pic", newPic);
    formData.append("social_links", JSON.stringify(socialLinks));

    try {
      const response = await fetch(`${API_BASE}/general/user/update`, {
        method: "POST",
        body: formData,
        credentials: "include",
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
      setYourEvents(prev => prev.filter(e => e.id !== eventId));
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      await Api.instance.delete(`${API_BASE}/general/booking/delete/${bookingId}`, { withCredentials: true });
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const cometChatUser = await CometChat.getLoggedinUser();
      if (cometChatUser) await CometChat.logout();

      await Api.instance.post(`${API_BASE}/general/user/logout`, {}, { withCredentials: true });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Container my={40}>
      <Paper p="md">
        <Title order={1} mb="lg">Profile</Title>

        <Card shadow="sm" p="lg">
          <Stack gap="sm">
            <Group>
              <Avatar src={user.profile_pic || "/default-avatar.jpg"} alt="Profile Picture" size="xl" />
              <Stack>
                <Text size="lg"><strong>Name:</strong> {user.first_name} {user.last_name}</Text>
                <Text size="lg"><strong>Bio:</strong> {user.bio || '—'}</Text>
                <Text size="lg"><strong>Explorer:</strong> {user.is_traveler ? 'Yes' : 'No'}</Text>
                <Text size="lg"><strong>Creator:</strong> {user.is_host ? 'Yes' : 'No'}</Text>
              </Stack>
            </Group>
            <Button onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Social Links Preview */}
        {user.social_links && Object.keys(user.social_links).length > 0 && (
          <Card shadow="sm" p="lg">
            <Title order={2}>Your Social Links</Title>
            <Stack>
              {Object.entries(user.social_links).map(([platform, url]) => (
                <Text key={platform}>
                  <strong>{platform.charAt(0).toUpperCase() + platform.slice(1)}:</strong>{' '}
                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                </Text>
              ))}
            </Stack>
          </Card>
        )}

        <Divider my="lg" />

        {/* ... Remaining sections unchanged ... */}

        <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Profile">
          <TextInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} />
          <TextInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} />
          <Stack gap="xs">
            <Text size="sm" fw={500}>Upload Profile Picture</Text>
            <input type="file" accept="image/*" onChange={(e) => setNewPic(e.target.files?.[0] ?? null)} />
          </Stack>
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.currentTarget.value)} minRows={3} />
          <Divider my="md" />
          <Title order={4}>Social Links</Title>
          <TextInput label="Instagram" value={socialLinks.instagram || ""} onChange={(e) => handleSocialLinkChange("instagram", e.currentTarget.value)} />
          <TextInput label="YouTube" value={socialLinks.youtube || ""} onChange={(e) => handleSocialLinkChange("youtube", e.currentTarget.value)} />
          <TextInput label="Website" value={socialLinks.website || ""} onChange={(e) => handleSocialLinkChange("website", e.currentTarget.value)} />
          <Button onClick={handleUpdate} mt="md">Save Changes</Button>
        </Modal>
      </Paper>
    </Container>
  );
}
