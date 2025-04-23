import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Group, Avatar, Rating, Title, Text, Divider, Loader, Center, Button } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useNavigate } from "react-router-dom";

export function ViewHostProfile() {
    const { hostId } = useParams();
    const navigate = useNavigate();
  
    const [host, setHost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hostEvents, setHostEvents] = useState<any[]>([]);
  
    const handleStartDM = async () => {
      try {
        await Api.instance.post(`${API_BASE}/general/messaging/start-dm`, {
          target_user_id: host.id,
        }, { withCredentials: true });
    
        // ✅ Reload the messages page AFTER the backend reflects the change
        navigate("/messages", { replace: true });
    
      } catch (error) {
        console.error("Failed to start DM:", error);
        alert("Could not start conversation. Try again.");
      }
    };
    
    useEffect(() => {
      async function fetchHost() {
        try {
          const res = await Api.instance.get(`${API_BASE}/general/user/${hostId}`);
          setHost(res.data);
        } catch (err) {
          console.error("Failed to fetch host profile:", err);
        } finally {
          setLoading(false);
        }
      }
  
      fetchHost();
    }, [hostId]);
  
    useEffect(() => {
      async function fetchHostEvents() {
        try {
          const res = await Api.instance.get(`${API_BASE}/general/host/${hostId}/events`);
          setHostEvents(res.data);
        } catch (err) {
          console.error("Failed to fetch host events:", err);
        }
      }
  
      fetchHostEvents();
    }, [hostId]);
  
    if (loading) return <Center><Loader /></Center>;
    if (!host) return <Text>Host not found</Text>;
  
    return (
      <Container my={40}>
        <Title order={1}>{`${host.first_name} ${host.last_name}`}</Title>
        <Card shadow="sm" p="lg">
          <Group>
            <Avatar src={host.profile_pic} size="xl" />
            <Text>{host.bio}</Text>
          </Group>
        </Card>
        <Divider my="lg" />
        <Button variant="filled" color="blue" onClick={handleStartDM}>
          Message {host.first_name}
        </Button>
        <Divider my="lg" />
  
        {/* Experiences by this host */}
        <Card shadow="sm" p="lg">
          <Title order={2}>Experiences by {host.first_name}</Title>
          {hostEvents.length === 0 ? (
            <Text>This host has not published any experiences yet.</Text>
          ) : (
            hostEvents.map(event => (
              <Card 
                key={event.id} 
                withBorder 
                shadow="xs" 
                my="sm" 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/experience/${event.id}`)}
              >
                <Group justify="space-between">
                  <div>
                    <Title order={4}>{event.title}</Title>
                    <Text>{new Date(event.occurence_date).toLocaleDateString()}</Text>
                    <Text c="dimmed" size="sm">{event.location}</Text>
                  </div>
                  {event.photos && event.photos.length > 0 && (
                    <Avatar src={event.photos[0]} size={80} radius="md" />
                  )}
                </Group>
              </Card>
            ))
          )}
        </Card>
      </Container>
    );
  }
  
