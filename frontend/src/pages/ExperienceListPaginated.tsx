import React from "react";
import { SingleExperienceView } from "@/components/SingleExperienceView/SingleExperienceView";
import { Divider, Center, Loader, Text } from "@mantine/core";
import Api, { API_BASE } from "@/api/API";
import { ExperienceData } from "@/types/ExperienceTypes"; // Import the shared type

// Example experience with the correct structure
const exampleExperience: ExperienceData = {
  id: 1,
  title: "Go on a hike - title",
  description: "This is a wonderful experience that you'll never forget. Come and enjoy the adventure!",
  unique_aspect: "John is the first person to ever hike in Boulder",
  price: 9,
  location: "Boulder, Colorado",
  occurence_date: "2023-07-01",
  photos: [
    "https://media.gettyimages.com/id/673024209/photo/sunrise-over-boulder-from-second-flatiron.jpg?s=612x612&w=0&k=20&c=WYY1s1CV7xfz9dRh9GsISrvZBM4YCbsuo1WG-8Mt2gk=",
    "https://media.gettyimages.com/id/1223232576/photo/view-from-chautauqua-trailhead-in-boulder-colorado-with-hikers-on-the-trail-with-the.jpg?s=612x612&w=0&k=20&c=GBozgXiYRWsJKBOGmpUKu3mA0ZSM83TgM53SnW_xA9c=",
    "https://media.gettyimages.com/id/165697561/photo/boulder-colorado-flatirons.jpg?s=612x612&w=0&k=20&c=_y_9TwcIFhnuNxfztZu-jZTkm2TEKjw1FXP-PDuX92o="
  ],
  host_first_name: "John",
  host_last_name: "Doe", // <- Added
  number_of_guests: 5,    // <- Added
  number_of_bookings: 2,  // <- Added
  reviews: [
    { text: "This was an amazing experience!", rating: 5 },
    { text: "Highly recommend to anyone visiting the area.", rating: 4 }
  ]
};


export function ExperienceListPaginated() {
  const [experiences, setExperiences] = React.useState<ExperienceData[]>([exampleExperience]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await Api.instance.get<ExperienceData[]>(`${API_BASE}/general/event/get_all`);
        
        // Ensure `host_first_name` is present in each experience
        const experiencesWithHost = response.data.map(experience => ({
          ...experience,
          host_first_name: experience.host_first_name ?? "Unknown Host",
          photos: experience.photos ?? [] // ✅ Ensures photos is always a `string[]`
        }));

        setExperiences(experiencesWithHost);
      } catch (err) {
        console.error("Error fetching experiences:", err);
        setError("Failed to load experiences. Please try again.");
      }
      setLoading(false);
    }

    fetchExperiences();
  }, []);

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
      {experiences.map((experience) => (
        <div key={experience.id}> 
          <SingleExperienceView experienceData={experience} />
          <Divider size="xl" />
        </div>
      ))}    
    </>
  );
}
