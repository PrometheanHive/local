import React from "react";
import { SingleExperienceView } from "@/components/SingleExperienceView/SingleExperienceView";
import { Divider, Loader, Center, Text } from "@mantine/core";
import Api, { API_BASE } from "@/api/API";
import { useParams } from "react-router-dom";
import { ExperienceData, Review } from "@/types/ExperienceTypes"; // Import shared types
import { Link } from 'react-router-dom';

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

      // Ensure `host_first_name` and `photos` are always defined
      const combinedData: ExperienceData = {
        ...eventData,
        host_first_name: eventData.host_first_name || "Unknown Host", // Default value
        photos: eventData.photos ?? [], // Ensure `photos` is always a `string[]`
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
