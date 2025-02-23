import React from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import { Container, Title, Grid, Col } from '@mantine/core'; 

export function LandingPage() {
  const [experiences, setExperiences] = React.useState([]);

  React.useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await Api.instance.get(`${API_BASE}/general/event/get_all`);
        console.log("API Response:", response.data);

        // Ensure experiences is always an array
        setExperiences(Array.isArray(response.data) ? response.data : []);

      } catch (error) {
        console.error("Error fetching experiences:", error);
        setExperiences([]); // Prevents crashes
      }
    }

    fetchExperiences();
  }, []);

  return (
    <div className="landing-page">
      <section id="Events">
        <Title order={1} align="center" style={{ marginBottom: '30px', paddingTop:"30px"}}>
          Browse Experiences
        </Title>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {experiences.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '18px' }}>No experiences available.</p>
          ) : (
            experiences.map((card, index) =>
              card.number_of_guests !== 0 && (
                <div key={index} style={{ width: '300px', marginBottom: '20px' }}>
                  <Link to={`/experience/${card.id}`} style={{ textDecoration: "none" }}>
                    <CardItem
                      title={card.title}
                      description={card.description}
                      imageUrl={card.photos?.[0] || "https://via.placeholder.com/300"} // Handle missing images
                      available={card.number_of_guests - (card.number_of_bookings || 0)} // Ensure values are valid
                    />
                  </Link>
                </div>
              )
            )
          )}
        </div>
      </section>
    </div>
  );
}
