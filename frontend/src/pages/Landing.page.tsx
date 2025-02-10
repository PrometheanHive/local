import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import { Container, Title } from '@mantine/core';

export function LandingPage() {
  const [experiences, setExperiences] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await Api.instance.get(`${API_BASE}/general/event/get_all`, { withCredentials: true });

        // Validate response
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format");
        }

        setExperiences(response.data);

      } catch (error) {
        console.error("Error fetching experiences:", error);

        if (error.response) {
          if (error.response.status === 401) {
            setError("You must be logged in to view experiences.");
          } else {
            setError(`Error: ${error.response.status} - ${error.response.statusText}`);
          }
        } else {
          setError("An unexpected error occurred.");
        }

        setExperiences([]); // Prevents crashes
      }
    }

    fetchExperiences();
  }, []);

  return (
    <div className="landing-page">
      <section id="Events">
        <Title order={1} align="center" style={{ marginBottom: '30px', paddingTop: "30px" }}>
          Browse Experiences
        </Title>

        {error ? (
          <p style={{ textAlign: 'center', fontSize: '18px', color: 'red' }}>{error}</p>
        ) : experiences.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '18px' }}>No experiences available.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {experiences.map((card, index) =>
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
            )}
          </div>
        )}
      </section>
    </div>
  );
}
