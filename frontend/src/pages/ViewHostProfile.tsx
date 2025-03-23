import React from 'react';
import { Container, Card, Group, Avatar, Rating, Title, Text, Divider } from '@mantine/core';

export function ViewHostProfile() {
    const host = {
        name: "John Doe",
        description: "Hi, I'm John! I have been hosting adventure experiences for over 10 years and love sharing my passion for the outdoors. I have been on many adventures over the years, and I would love for you to join me!",
        photo: "https://via.placeholder.com/150", // Replace with an actual image URL
    };

    return (
        <Container my={40}>
            <Title order={1} mb="lg">{host.name} Profile</Title>

            <Card shadow="sm" p="lg">
                <Group justify="space-between" align="center" style={{ width: '100%' }}>
                    <Avatar src={host.photo} alt="Host photo" size="xl" />
                    <div style={{ flex: 1, marginLeft: 20 }}>
                        <Text>{host.description}</Text>
                    </div>
                </Group>
            </Card>

            <Divider my="lg" />

            <Card shadow="sm" p="lg">
                <Title order={2}>Local Score</Title>
                <Rating value={5} readOnly />
            </Card>

            <Divider my="lg" />

            <Card shadow="sm" p="lg">
                <Title order={2}>Reviews</Title>
                <Rating value={4} readOnly />
                <Text>I loved John, it was a great hike with him!</Text>
                <Rating value={5} readOnly />
                <Text>John showed us a hidden cave on the hike that was amazing! Great personality, would really recommend him.</Text>
                <Rating value={5} readOnly />
                <Text>If you want a thrilling adventure in the outdoors, then John is your guy!</Text>
            </Card>
        </Container>
    );
}
