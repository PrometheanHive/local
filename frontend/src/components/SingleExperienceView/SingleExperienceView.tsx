import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Api, { API_BASE } from '@/api/API';
import {
  Paper, Title, Text, Container, Grid, Image, Button, Divider, Card, Badge, Stack, Avatar, Group, Rating, Modal, Textarea
} from '@mantine/core';

interface Review {
  text: string;
  rating: number;
}

interface ExperienceData {
  id: number;
  title: string;
  description: string;
  unique_aspect: string;
  price: number | string;
  location: string;
  photos: string[];
  reviews: Review[];
  occurence_date: string;
  host_first_name: string;
}

interface SingleExperienceViewProps {
  experienceData: ExperienceData;
}

export function SingleExperienceView({ experienceData }: SingleExperienceViewProps) {
  const photos = experienceData.photos;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const navigate = useNavigate();

  const handleReviewSubmit = async () => {
    console.log(reviewText, reviewRating);
    const values = { text: reviewText, rating: reviewRating, event_id: experienceData.id };
    await Api.instance.post(`${API_BASE}/general/reviews/create`, values, { withCredentials: true });

    setIsModalOpen(false);
    setReviewText('');
    setReviewRating(0);
  };

  function getCsrfToken() {
    const cookies = document.cookie.split(';');
    const csrfToken = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
    return csrfToken ? decodeURIComponent(csrfToken.split('=')[1]) : '';
  }

  const handleBookingRegister = async () => {
    const csrfToken = getCsrfToken();

    const headers = {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    };

    const payload = { event: experienceData.id };
    await Api.instance.post(`${API_BASE}/general/booking/register/${experienceData.id}`, payload, {
      headers: headers, withCredentials: true
    });
    
    navigate("/sign-in");
  };

  return (
    <Container my={40}>
      <Title order={1} mb="lg">{experienceData.title}</Title>
      <Paper p="md" shadow="xs">
        <Stack gap="xl">
          {/* Photo Gallery */}
          <Card shadow="sm">
            <Title order={2}>Photos</Title>
            <Grid mt="md">
              {photos.map((photo: string, index: number) => (
                <Grid.Col span={4} key={index}>
                  <Image src={photo} alt={`Experience photo ${index + 1}`} fit="cover" />
                </Grid.Col>
              ))}
            </Grid>
          </Card>

          {/* The Experience */}
          <Card shadow="sm" p="lg">
            <Stack gap="sm">
              <Title order={2}>The Experience</Title>
              <Text size="lg" style={{ fontFamily: 'Arial, sans-serif' }}><strong>Description:</strong> {experienceData.description}</Text>
              <Text size="lg" style={{ fontFamily: 'Arial, sans-serif' }}><strong>Unique:</strong> {experienceData.unique_aspect}</Text>
              <Text size="lg" style={{ fontFamily: 'Arial, sans-serif' }}>
                <strong>Pricing:</strong> ${typeof experienceData.price === 'number' ? experienceData.price.toFixed(2) : parseFloat(experienceData.price).toFixed(2)}
              </Text>
              <Text size="lg" style={{ fontFamily: 'Arial, sans-serif' }}><strong>Location:</strong> {experienceData.location}</Text>
              <Divider />

              {/* Reviews */}
              <Card shadow="sm" p="lg">
                <Stack gap="sm">
                  <Title order={3}>Reviews</Title>
                  {experienceData.reviews && experienceData.reviews.map((review: Review, index: number) => (
                    <Text key={index}>
                      <Rating value={review.rating} readOnly />
                      {review.text}
                    </Text>
                  ))}
                  <Button onClick={() => setIsModalOpen(true)}>Add a Review</Button>
                </Stack>
              </Card>
            </Stack>
          </Card>

          {/* Meet Your Host */}
          <Grid>
            <Grid.Col span={6}>
              <Card shadow="sm" p="lg">
                <Group justify="space-between" align="center" style={{ width: '100%' }}>
                  <Avatar src="https://via.placeholder.com/150" alt="Host photo" size="lg" />
                  <div style={{ flex: 1, marginLeft: 20 }}>
                    <Title order={3}>{experienceData.host_first_name}</Title>
                  </div>
                </Group>
              </Card>
            </Grid.Col>

            {/* Available Dates */}
            <Grid.Col span={6}>
              <Card shadow="sm" p="lg">
                <Stack gap="sm">
                  <Title order={3}>Available Dates</Title>
                  <Button onClick={handleBookingRegister} variant="filled" color="blue" fullWidth style={{ margin: '10px 0' }}>
                    Book Now for {new Date(experienceData.occurence_date).toLocaleDateString()} at {new Date(experienceData.occurence_date).toLocaleTimeString([], { timeStyle: 'short' })}
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>

        {/* Review Modal */}
        <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Your Review">
          <Textarea
            placeholder="Your review"
            value={reviewText}
            onChange={(event) => setReviewText(event.currentTarget.value)}
            minRows={3}
          />
          <Rating
            value={reviewRating}
            onChange={setReviewRating}
            mt="md"
          />
          <Button onClick={handleReviewSubmit} mt="md">Submit Review</Button>
        </Modal>
      </Paper>
    </Container>
  );
}
