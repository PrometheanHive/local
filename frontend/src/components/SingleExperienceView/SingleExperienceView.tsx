import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Api, { API_BASE } from "@/api/API";
import { ExperienceData } from "@/types/ExperienceTypes"; // Import the shared type
import {
  Paper,
  Title,
  Text,
  Container,
  Grid,
  Image,
  Button,
  Divider,
  Card,
  Stack,
  Avatar,
  Group,
  Rating,
  Modal,
  Textarea,
  Badge
} from "@mantine/core";
import { Link } from 'react-router-dom';

interface SingleExperienceViewProps {
  experienceData: ExperienceData;
}

export function SingleExperienceView({ experienceData }: SingleExperienceViewProps) {
  const photos = experienceData.photos ?? []; // Ensure it's always a `string[]`
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const navigate = useNavigate();

  const handleReviewSubmit = async () => {
    const values = { text: reviewText, rating: reviewRating, event_id: experienceData.id };
    await Api.instance.post(`${API_BASE}/general/reviews/create`, values, { withCredentials: true });

    setIsModalOpen(false);
    setReviewText("");
    setReviewRating(0);
  };

  const handleBookingRegister = async () => {
    const headers = { "Content-Type": "application/json" };
    const payload = { event: experienceData.id };
    await Api.instance.post(`${API_BASE}/general/booking/register/${experienceData.id}`, payload, {
      headers: headers,
      withCredentials: true,
    });

    navigate("/sign-in");
  };

  const formattedDate = new Date(experienceData.occurence_date).toLocaleDateString();
  const formattedTime = new Date(experienceData.occurence_date).toLocaleTimeString([], { timeStyle: "short" });

  return (
    <Container my={40}>
      <Title order={1} mb="lg">{experienceData.title}</Title>
      <Paper p="md" shadow="xs">
        <Stack gap="xl">
          <Card shadow="sm">
            <Title order={2}>Photos</Title>
            <Grid mt="md">
              {photos.map((photo, index) => (
                <Grid.Col span={4} key={index}>
                  <Image src={photo} alt={`Experience photo ${index + 1}`} fit="cover" />
                </Grid.Col>
              ))}
            </Grid>
          </Card>

          <Card shadow="sm" p="lg">
            <Stack gap="sm">
              <Title order={2}>The Experience</Title>
              <Text size="lg"><strong>Description:</strong> {experienceData.description}</Text>
              <Text size="lg"><strong>Unique:</strong> {experienceData.unique_aspect}</Text>
              <Text size="lg">
                <strong>Pricing:</strong> ${typeof experienceData.price === "number" ? experienceData.price.toFixed(2) : parseFloat(experienceData.price).toFixed(2)}
              </Text>
              <Text size="lg"><strong>Date:</strong> {formattedDate}</Text>
              <Text size="lg"><strong>Location:</strong> {experienceData.location}</Text>
              {experienceData.tags && experienceData.tags.length > 0 && (
                <Group mt="md" gap="xs">
                  {experienceData.tags.map((tag, idx) => (
                    <Badge key={idx} color="blue" variant="light">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
              <Divider />

              <Card shadow="sm" p="lg">
                <Stack gap="sm">
                  <Title order={3}>Reviews</Title>
                  {experienceData.reviews.map((review, index) => (
                    <Text key={index}>
                      <Rating value={review.rating} readOnly /> {review.text}
                    </Text>
                  ))}
                  <Button onClick={() => setIsModalOpen(true)}>Add a Review</Button>
                </Stack>
              </Card>
            </Stack>
          </Card>

          <Grid>
            <Grid.Col span={6}>
              <Card shadow="sm" p="lg">
                <Link to={`/host/${experienceData.host_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Group justify="space-between" align="center" style={{ width: '100%' }}>
                    <Avatar 
                      src={experienceData.host_profile_pic || "/default-avatar.jpg"} 
                      alt={`${experienceData.host_first_name} ${experienceData.host_last_name}`} 
                      size="lg" 
                    />
                    <Title order={3}>
                      {experienceData.host_first_name} {experienceData.host_last_name}
                    </Title>
                  </Group>
                </Link>
              </Card>
            </Grid.Col>

            <Grid.Col span={6}>
              <Card shadow="sm" p="lg">
                <Stack gap="sm">
                  <Title order={3}>Available Dates</Title>
                  <Button
                    onClick={handleBookingRegister}
                    variant="filled"
                    color="blue"
                    fullWidth
                    style={{ margin: "10px 0" }}
                  >
                    RSVP for {formattedDate} at {formattedTime}
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>

        <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Your Review">
          <Textarea
            placeholder="Your review"
            value={reviewText}
            onChange={(event) => setReviewText(event.currentTarget.value)}
            minRows={3}
          />
          <Rating value={reviewRating} onChange={setReviewRating} mt="md" />
          <Button onClick={handleReviewSubmit} mt="md">Submit Review</Button>
        </Modal>
      </Paper>
    </Container>
  );
}