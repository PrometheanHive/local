import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mantine/dates';
import { Container, Paper, Title, Text, getContrastColor, TextInput, Card, Button, Divider, Stack } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { useNavigate } from 'react-router-dom';



export function AccountSettings(props) {
    // const user = {
    //     name: "Johnny Doe",
    //     email: "jdoe@gmail.com"
    // };
    const user = props.user
    console.log(user)
    const navigate = useNavigate();
    const [name, setName] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Replace 'Api.instance.get' with your API call method if different
                const response = await Api.instance.get(`${API_BASE}/general/user/bookings`, { withCredentials: true });
                setBookings(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            }
        };

        fetchBookings();
    }, []); // Empty dependency array means this effect will only run once after the component mounts.
    const handleLogout = async (event) => {
        const response = await Api.instance.post(`${API_BASE}/general/user/logout`, {}, { withCredentials: true });
        CometChatUIKit.logout().then(() => {
            console.log("Logout successful");
        }).catch(console.log);
        window.location.reload();
        navigate('/');
    }
    return (
        <Container my={40}>
            <Paper padding="md">
                <Title order={1} align="center" mb="lg">Profile</Title>
                <Card shadow="sm" p="lg">
                    <Stack spacing="sm">
                        <Title order={2}>Account details</Title>
                        <Text size="lg" weight={500} style={{ fontFamily: 'Arial, sans-serif' }}><span style={{ fontWeight: "700" }}>Name:</span> {<Text>{name}</Text>}
                        </Text>
                        <Text size="lg" weight={500} style={{ fontFamily: 'Arial, sans-serif' }}><span style={{ fontWeight: "700" }}>Email:</span><Text>{email}</Text></Text>
                        {/* <Button type="submit" variant="filled" color="black" style={{width:"150px"}}>
                    Update
                </Button> */}
                    </Stack>
                </Card>
                <Divider />
                <Card shadow="sm">
                    <Stack spacing="sm">
                        <Title order={2}>Your Bookings</Title>
                        {bookings.map(booking => (
                            <Title order={5} key={booking.id}>
                                {booking.event_title} - Date: {new Date(booking.event_date).toLocaleDateString()} at {new Date(booking.event_date).toLocaleTimeString([], { timeStyle: 'short' })}
                            </Title>
                        ))}
                    </Stack>
                </Card>

                <Card shadow="sm">
                    <Stack spacing="sm">
                        <Title order={2}>Payment methods</Title>
                        <Button type="submit" variant="filled" color="black" style={{ width: "200px" }}>
                            Add payment method
                        </Button>
                    </Stack>
                </Card>
                <Divider />
                <Card shadow="sm">
                    <Stack spacing="sm">
                        {/* <Button type="submit" variant="filled" color="black" style={{width:"200px"}}>
                Become a host
            </Button> */}
                        <Button onClick={handleLogout}>Logout</Button>
                    </Stack>
                </Card>
            </Paper>
        </Container>
    );
}