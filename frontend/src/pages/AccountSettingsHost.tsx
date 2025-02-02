import React, { useState } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { Container, Paper, Title, Text, getContrastColor, TextInput, Card, Button, Divider, Stack } from '@mantine/core';

export function AccountSettingsHost() {
    const user = {
        name: "Johnny Doe",
        email: "jdoe@gmail.com",
        earnings: "$1000"
    };
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [earnings, setEarnings] = useState(user.earnings);
    return (
   <Container my={40}>
        <Paper padding = "md">
        <Title order = {1} align = "center" mb = "lg">Account Management</Title>
        <Card shadow="sm" p="lg">
            <Stack spacing="sm">
                <Title order={2}>Account details</Title>
                <Text size="lg" weight={500} style={{ fontFamily: 'Arial, sans-serif' }}><span style={{ fontWeight: "700" }}>Name:</span> {<TextInput 
                placeholder= "Name"
                value= {name}
                onChange = {(event) => setName(event.target.value)}
                style = {{width: "500px", display: 'inline-block',  textAlign: 'left'} }
                required
                />}
                </Text>
                <Text size="lg" weight={500} style={{ fontFamily: 'Arial, sans-serif' }}><span style={{ fontWeight: "700" }}>Email:</span> {<TextInput 
                placeholder= "Name"
                value= {email}
                onChange = {(event) => setEmail(event.target.value)}
                style = {{width: "500px", display: 'inline-block',  textAlign: 'left'} }
                required
                />}</Text>
                <Button type="submit" variant="filled" color="black" style={{width:"150px"}}>
                    Update
                </Button>
              </Stack>
        </Card>
        <Divider />
        <Card shadow="sm">
        <Stack spacing="sm">
            <Title order={2}>Earnings summary</Title>
            <Text size="lg" weight={500} style={{ fontFamily: 'Arial, sans-serif' }}>
                <span style={{ fontWeight: "700", marginLeft: '5px' }}>Earnings this month:</span> {earnings}
            </Text>
            </Stack>
        </Card>
        <Divider />
        <Card shadow="sm">
        <Stack spacing="sm">
            <Title order={2}>Create an event</Title>
            <Button type="submit" variant="filled" color="black" style={{width:"200px"}}>
                New event
            </Button>
        </Stack>
        </Card>
        </Paper>
    </Container>
   );
}