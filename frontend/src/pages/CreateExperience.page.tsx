import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Text, Textarea, NumberInput, Button, Group, Paper, Title, Container, FileInput, Grid } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar } from '@tabler/icons-react';
import Api, { API_BASE } from '@/api/API';

export function CreateExperience() {
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const form = useForm({
    initialValues: {
      title: '',
      number_of_guests: undefined as number | undefined,
      number_of_bookings: 0,
      description: '',
      unique_aspect: '',
      price: undefined as number | undefined,
      occurence_date: '',
      location: '',
      photos: null as File[] | null,
      passphrase: '',
    },
  });

  const navigate = useNavigate();

  const handleFileChange = async (event: File[]) => {
    const file = event[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await Api.instance.post<{ fileUrl: string }>(`${API_BASE}/general/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.fileUrl) {
        setFileUrls((currentUrls) => [...currentUrls, response.data.fileUrl]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    console.log("Submitting experience with images:", fileUrls);
    if (values.passphrase !== "iamahost") {
      alert("Incorrect host code phrase. Please contact support.");
      return;
    }

    const updatedFormValues = {
      ...values,
      photos: fileUrls,
    };

    try {
      const response = await Api.instance.post(`${API_BASE}/general/event/create`, updatedFormValues, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log("Experience created:", response);
      navigate("/");
    } catch (error) {
      console.error("Error creating experience:", error);
    }
  };

  return (
    <Container my={40}>
      <Paper p="md" shadow="xs">
        <Title order={2} mb="lg">Create a new experience</Title>
        <Text size="sm" mb="lg">
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
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ fontSize: '0.875rem', marginBottom: '4px' }}>Experience Pictures</legend>
                <FileInput
                  required
                  onChange={(files) => handleFileChange(files as File[])}
                  multiple
                  accept="image/png,image/jpeg"
                />
                {fileUrls.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <Text size="sm" fw={500}>Uploaded Images:</Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                      {fileUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>
              <DateTimePicker
                required dropdownType="modal"
                label="Experience Date"
                placeholder="Pick a date"
                {...form.getInputProps('occurence_date')}
              />

              <TextInput required label="Experience Location" {...form.getInputProps('location')} />
              <TextInput
                required
                label="Enter Host Code Phrase"
                placeholder="Enter code to post"
                {...form.getInputProps('passphrase')}
                style={{ marginTop: 20, width: "100%" }}
              />
              <Group justify="space-between" mt="md">
                <Button type="submit">Post Experience</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
