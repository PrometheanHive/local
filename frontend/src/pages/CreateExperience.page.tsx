import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Text, Textarea, NumberInput, Button, Group, Paper, Title, Container, FileInput, Grid } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import Api, { API_BASE } from '@/api/API';

export function CreateExperience() {
  const [fileUrls, setFileUrls] = useState([]);
  
  const form = useForm({
    initialValues: {
      title: '',
      number_of_guests: undefined,
      number_of_bookings: 0,
      description: '',
      unique_aspect: '',
      price: undefined,
      occurence_date: '',
      location: '',
      photos: null,
    },
  });

  const navigate = useNavigate();

  const handleFileChange = async (event) => {
    const file = event[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await Api.instance.post(`${API_BASE}/general/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.fileUrl) {
        setFileUrls((currentUrls) => [...currentUrls, response.data.fileUrl]); // Store uploaded file path
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = async (values) => {
    console.log("Submitting experience with images:", fileUrls);

    const updatedFormValues = {
      ...values,
      photos: fileUrls, // Send saved file paths instead of file objects
    };

    try {
      const response = await Api.instance.post(`${API_BASE}/general/event/create`, updatedFormValues, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("Experience created:", response);
      navigate("/"); // ✅ Only keep this navigate, remove the extra one
    } catch (error) {
      console.error("Error creating experience:", error);
    }
  };

  return ( // ✅ Correct placement of return
    <Container my={40}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center" mb="lg">Create a new experience</Title>
        <Text align="center" size="sm" mb="lg">
          This is where you can post any experiences you wish to share with travelers! Make sure to fill out every single category as they are all required. Once you have filled everything out, click “Post experience” and we will take it from there.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput required label="Experience Title" {...form.getInputProps('title')} />
              <NumberInput required label="Number of Participants" {...form.getInputProps('number_of_guests')} />
              <Textarea required label="Experience Description" {...form.getInputProps('description')} minRows={3} />
              <Textarea required label="Why is this experience unique/special?" {...form.getInputProps('unique_aspect')} minRows={3} />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput required label="Experience Price" {...form.getInputProps('price')} />
              <FileInput required label="Experience Pictures" onChange={handleFileChange} multiple accept="image/png,image/jpeg" />
              <DateTimePicker required label="Experience Date" {...form.getInputProps('occurence_date')} placeholder="Pick a date" />
              <TextInput required label="Experience Location" {...form.getInputProps('location')} />
              <Group position="apart" mt="md">
                <Button type="submit">Post Experience</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
