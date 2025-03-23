import React, { useState } from 'react';
import { Container, Paper, Title, Text, TextInput, Card, Button, Divider, Stack } from '@mantine/core';

export function AccountSettingsHost() {
  const user = {
    name: "Johnny Doe",
    email: "jdoe@gmail.com",
    earnings: "$1000"
  };

  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [earnings] = useState<string>(user.earnings);

  return (
    <Container my={40}>
      <Paper p="md">
        <Title order={1} mb="lg">Account Management</Title>

        {/* Account Details */}
        <Card shadow="sm" p="lg">
          <Stack gap="sm">
            <Title order={2}>Account details</Title>
            <Stack>
              <TextInput
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Stack>
            <Button type="submit" variant="filled" color="black" style={{ width: "150px" }}>
              Update
            </Button>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Earnings Summary */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Earnings Summary</Title>
            <Text size="lg"><strong>Earnings this month:</strong> {earnings}</Text>
          </Stack>
        </Card>

        <Divider my="lg" />

        {/* Create an Event */}
        <Card shadow="sm">
          <Stack gap="sm">
            <Title order={2}>Create an Event</Title>
            <Button type="submit" variant="filled" color="black" style={{ width: "200px" }}>
              New Event
            </Button>
          </Stack>
        </Card>
      </Paper>
    </Container>
  );
}
