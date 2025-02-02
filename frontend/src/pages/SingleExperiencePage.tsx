import React from 'react';
import { SingleExperienceView } from "@/components/SingleExperienceView/SingleExperienceView";
import { Divider } from '@mantine/core';
import Api, { API_BASE } from '@/api/API';
import { useParams } from 'react-router-dom';

export function SingleExperiencePage() {
  const [experience, setExperience] = React.useState(null); // Start with null to indicate loading
  const { id } = useParams();

  const fetchEventDataAndReviews = async () => {
    try {
      // Fetch the event details
      const eventResponse = await Api.instance.get(`${API_BASE}/general/event/id/${id}`);
      const eventData = eventResponse.data;
      console.log(eventResponse)

      // Fetch the reviews for the event
      const reviewsResponse = await Api.instance.get(`${API_BASE}/general/event/${id}/reviews`);
      const reviewsData = reviewsResponse.data;

      // Combine the event data with its reviews
      const combinedData = {
        ...eventData,
        reviews: reviewsData // Assuming the reviews are an array
      };

      setExperience(combinedData);
      console.log(combinedData);
    } catch (error) {
      console.error("Failed to fetch event data and reviews:", error);
      // Handle the error appropriately
    }
  };

  React.useEffect(() => {
    fetchEventDataAndReviews();
  }, [id]); // Re-run when `id` changes

  if (!experience) {
    return <div>Loading...</div>; // Loading state
  }

  return (
    <>
      <SingleExperienceView experienceData={experience} />
      <Divider size="xl" />
    </>
  );
}
