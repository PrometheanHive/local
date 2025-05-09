import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput, Text, Textarea, NumberInput, Button, Group,
  Paper, Title, Container, CloseButton, Grid, Center, Stack
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import Api, { API_BASE } from '@/api/API';

// ✅ Add this to avoid TypeScript errors on window.google
declare global {
  interface Window {
    google: any;
  }
}
interface FormValues {
  title: string;
  number_of_guests: number | undefined;
  number_of_bookings: number;
  description: string;
  unique_aspect: string;
  price: number | undefined;
  occurence_date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photos: File[];
  passphrase: string;
}

export function CreateExperience() {
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      number_of_guests: undefined,
      number_of_bookings: 0,
      description: '',
      unique_aspect: '',
      price: undefined,
      occurence_date: '',
      location: '',
      latitude: undefined,
      longitude: undefined,
      photos: [],
      passphrase: '',
    },
  });

  const navigate = useNavigate();
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autocompleteRef.current) return;
  
    const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current);
    autocomplete.setFields(["formatted_address", "geometry"]);
  
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
  
      // ✅ Check for geometry existence before using it
      if (!place.geometry || !place.geometry.location) {
        alert("Please select a valid place from the suggestions.");
        return;
      }
  
      const address = place.formatted_address ?? '';
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
  
      form.setValues({
        ...form.values,
        location: address,
        latitude: lat,
        longitude: lng
      });
    });
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    if (values.passphrase !== "iamahost") {
      alert("Incorrect host code phrase. Please contact support.");
      return;
    }

    try {
      const eventResponse = await Api.instance.post(`${API_BASE}/general/event/create`, {
        ...values,
        photos: []
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const eventId = eventResponse.data.event_id;
      const uploadedUrls: string[] = [];

      for (const file of values.photos) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await Api.instance.post<{ fileUrl: string }>(
          `${API_BASE}/general/upload?event_id=${eventId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        uploadedUrls.push(uploadResponse.data.fileUrl);
      }

      await Api.instance.patch(`${API_BASE}/general/event/id/${eventId}/update_photos`, {
        photos: uploadedUrls
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      navigate("/");
    } catch (error) {
      console.error("Error creating experience or uploading photos:", error);
      alert("There was a problem creating the experience. Please try again.");
    }
  };

  const selectedFiles = form.values.photos.map((file: File, index: number) => (
    <Group key={file.name} gap={4} align="center">
      <Text>
        <b>{file.name}</b> ({(file.size / 1024).toFixed(2)} kb)
      </Text>
      <CloseButton
        size="xs"
        onClick={() => {
          const updatedPhotos = form.values.photos.filter((_, i) => i !== index);
          form.setFieldValue('photos', updatedPhotos);
        }}
      />
    </Group>
  ));

  return (
    <Container my={40}>
      <Paper p="md" shadow="xs">
        <Title order={2} mb="lg">Create a new experience</Title>
        <Text size="sm" mb="lg">
          This is where you can post any experiences you wish to share with travelers! Make sure to fill out every single category as they are all required.
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
                <Dropzone
                  h={120}
                  p={0}
                  multiple
                  accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg]}
                  onDrop={(files: File[]) => {
                    const updated = [...form.values.photos, ...files];
                    form.setFieldValue('photos', updated);
                  }}
                  onReject={() => form.setFieldError('photos', 'Select images only')}
                >
                  <Center h={120}>
                    <Dropzone.Idle>Drop images here or click to upload</Dropzone.Idle>
                    <Dropzone.Accept>Drop images here</Dropzone.Accept>
                    <Dropzone.Reject>Invalid file type</Dropzone.Reject>
                  </Center>
                </Dropzone>
                {form.values.photos.length > 0 && (
                  <Stack mt="md">
                    <Text size="sm" fw={500}>Selected files:</Text>
                    {selectedFiles}
                  </Stack>
                )}
              </fieldset>

              <DateTimePicker
                required
                valueFormat="DD MMM YYYY hh:mm A"
                dropdownType="modal"
                label="Experience Date" {...form.getInputProps('occurence_date')}
                placeholder="Pick a date"
              />

              <div style={{ marginBottom: 16 }}>
                <Text size="sm" fw={500} mb={4}>Experience Location</Text>
                <input
                  ref={autocompleteRef}
                  placeholder="Start typing a location..."
                  style={{
                    padding: "8px 12px",
                    width: "100%",
                    border: "1px solid #ced4da",
                    borderRadius: 4,
                    fontSize: "14px"
                  }}
                  required
                />
              </div>

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
