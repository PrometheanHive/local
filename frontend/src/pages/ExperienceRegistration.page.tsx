import React from 'react';
import { Text, Textarea, NumberInput, Button, Group, Paper, Title, Container, Grid } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import Api, { API_BASE } from '@/api/API';

export function ExperienceRegistration() {
  // Form to hold data
  const form = useForm({
    initialValues: {
      experience_id: '',
      number_of_guests: undefined as number | undefined,
      occurence_date: '',
      special_info: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    console.log(JSON.stringify(values));

    try {
      const response = await Api.instance.post(`${API_BASE}/general/event/create`, values, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("Registration successful:", response.data);
    } catch (error) {
      console.error("Error submitting experience registration:", error);
    }
  };

  return (
    <Container my={40}>
      <Paper p="md" shadow="xs">
        <Title order={2} mb="lg">Experience Registration</Title>
        <Text size="sm" mb="lg">
          Please fill out the information below to secure your booking.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                required
                label="Number of Participants"
                {...form.getInputProps('number_of_guests')}
                placeholder="Please select a number of guests"
              />
              <DateTimePicker
                required
                label="Experience Date"
                {...form.getInputProps('occurence_date')}
                placeholder="Pick a date"
              />
              <Group justify="space-between" mt="md">
                <Button type="submit">Submit</Button>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Textarea
                required
                label="Special Information"
                {...form.getInputProps('special_info')}
                placeholder="Any special info you would like the host to know"
                minRows={3}
              />
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
