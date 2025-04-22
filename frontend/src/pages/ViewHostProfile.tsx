import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Group, Avatar, Rating, Title, Text, Divider, Loader, Center } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';

export function ViewHostProfile() {
  const { hostId } = useParams();
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      {/* <Card shadow="sm" p="lg">
        <Title order={2}>Local Score</Title>
        <Rating value={5} readOnly />
      </Card> */}

      <Divider my="lg" />

      {/* <Card shadow="sm" p="lg">
        <Title order={2}>Reviews (placeholder)</Title>
        <Text>This host's event reviews will be shown here.</Text>
      </Card> */}
    </Container>
  );
}
