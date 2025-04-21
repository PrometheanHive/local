import React, { useState } from 'react';
import { Container, Title, TextInput, Button, Text } from '@mantine/core';
import axios from 'axios';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/password-reset/', { email });
    setSubmitted(true);
  };

  return (
    <Container my={40}>
      <Title order={2}>Reset Your Password</Title>
      {submitted ? (
        <Text mt="md">Check your email for a password reset link.</Text>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <Button type="submit" mt="md">Send Reset Link</Button>
        </form>
      )}
    </Container>
  );
}
