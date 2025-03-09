import React from 'react';
import { SingleExperienceView } from "@/components/SingleExperienceView/SingleExperienceView";
import { Divider, Loader, Center, Text } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useParams } from 'react-router-dom';

interface Review {
  text: string;
  rating: number;
}

interface ExperienceData {
  id: number;
  title: string;
  description: string;
  unique_aspect: string;
  price: number;
  occurence_date: string;
  location: string;
  photos?: string[];
  reviews?: Review[];
  host_first_name: string; // Ensure this field is defined
}

export function SingleExperiencePage() {
  const [experience, setExperience] = React.useState<ExperienceData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const { id } = useParams();

  const fetchEventDataAndReviews = async () => {
    setLoading(true);
    try {
      // Fetch the event details
      const eventResponse = await Api.instance.get<ExperienceData>(`${API_BASE}/general/event/id/${id}`);
      const eventData = eventResponse.data;

      // Fetch the reviews for the event
      const reviewsResponse = await Api.instance.get<Review[]>(`${API_BASE}/general/event/${id}/reviews`);
      const reviewsData = reviewsResponse.data;

      // Ensure `host_first_name` exists, fallback to "Unknown Host"
      const hostFirstName = eventData.host_first_name || "Unknown Host";

      // Combine event data with reviews
      const combinedData: ExperienceData = {
        ...eventData,
        host_first_name: hostFirstName, //  Ensure this field is set
        reviews: reviewsData
      };

      setExperience(combinedData);
    } catch (error) {
      console.error("Failed to fetch event data and reviews:", error);
      setError("Error fetching experience details. Please try again later.");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchEventDataAndReviews();
  }, [id]);

  // Handle loading state
  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text color="red">{error}</Text>
      </Center>
    );
  }

  return (
    <>
      {experience && <SingleExperienceView experienceData={experience} />}
      <Divider size="xl" />
    </>
  );
}
