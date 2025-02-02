import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Text, Textarea, NumberInput, Button, Group, Paper, Title, Container, FileInput, Grid } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import Api, { API_BASE } from '@/api/API';
import S3 from 'react-s3';
import AWS from 'aws-sdk';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


//const s3Client = new S3Client({
  //region: 'us-east-1',
  //credentials: {
    //accessKeyId: '',
    //ecretAccessKey: ''
  //}
//});


export function CreateExperience() {
  const [fileUrls, setFileUrls] = useState([]);
  //Form to hold data
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
  function getCsrfToken() {
    const cookies = document.cookie.split(';');
    const csrfToken = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
    return csrfToken ? decodeURIComponent(csrfToken.split('=')[1]) : '';
  }

  const uploadFile = async (file) => {
    const bucketName = 'local-image-upload-bucket'; // Specify your bucket name
    const region = 'us-east-1'; // Specify the region
    const objectKey = file.name; // Use the file name as the key in S3

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: file
    });

    try {
      const data = await s3Client.send(command);
      console.log("File uploaded successfully.", data);

      // Construct the public URL
      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodeURIComponent(objectKey)}`;
      console.log("Public URL:", publicUrl);
      setFileUrls(currentUrls => [...currentUrls, publicUrl]);
      return publicUrl;
    } catch (err) {
      console.error("Error uploading file: ", err);
    }
  };

  const handleFileChange = (event) => {
    console.log(event)
    const file = event[0]
    const fileUrls = [];
    console.log(file)
    uploadFile(file)
  };

  const handleSubmit = async (values) => {
    console.log(fileUrls)
    let formValues = form.values;
    const updatedFormValues = {
      ...formValues,  // Spread existing form values to retain other field data
      photos: fileUrls   
    };
    // Get CSRF token from cookies
    const csrfToken = getCsrfToken();

    // Setting headers to include CSRF token
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    };
    console.log(updatedFormValues)
    // Sending the request with CSRF token in the header and credentials
    const response = await Api.instance.post(`${API_BASE}/general/event/create`, updatedFormValues, {
      headers: headers,
      withCredentials: true
    });

    console.log(response);

    // Navigation to homepage after successful post
    navigate('/');
  };

  //Different logic for handling photo uploads
  //May decide you don't need this but I thought they may want to be handled differently... i.e. uploaded immediaetly so user could see them before posting 

  return (
    <>
      <Container my={40}>
        <Paper padding="md" shadow="xs">
          <Title order={2} align="center" mb="lg">Create a new experience</Title>
          <Text align="center" size="sm" mb="lg">
            This is where you can post any experiences you wish to share with travelers! Make sure to fill out every single category as they are all required. Once you have filled everything out, click “Post experience” and we will take it from there.
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Experience Title"
                  {...form.getInputProps('title')}
                />
                <NumberInput
                  required
                  label="Number of Participants"
                  {...form.getInputProps('number_of_guests')}
                />
                <Textarea
                  required
                  label="Experience Description"
                  {...form.getInputProps('description')}
                  minRows={3}
                />
                <Textarea
                  required
                  label="Why is this experience unique/special?"
                  {...form.getInputProps('unique_aspect')}
                  minRows={3}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  required
                  label="Experience Price"
                  {...form.getInputProps('price')}
                />
                <FileInput
                  required
                  label="Experience Pictures"
                  onChange={handleFileChange} /*Logic to upload photos*/
                  multiple
                  accept="image/png,image/jpeg"
                />
                <DateTimePicker
                  required
                  label="Experience Date"
                  {...form.getInputProps('occurence_date')}
                  placeholder="Pick a date"
                />
                <TextInput
                  required
                  label="Experience Location"
                  {...form.getInputProps('location')}
                />
                <Group position="apart" mt="md">
                  <Button type="submit">Post Experience</Button>
                </Group>
              </Grid.Col>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
}
