import React from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import { Container, Title, Grid } from '@mantine/core';

interface Experience {
  id: number;
  title: string;
  description: string;
  photos?: string[];
  number_of_guests: number;
  number_of_bookings?: number;
}

export function LandingPage() {
  const [experiences, setExperiences] = React.useState<Experience[]>([]);

  React.useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await Api.instance.get<Experience[]>(`${API_BASE}/general/event/get_all`);
        console.log("API Response:", response.data);

        // Filter to only include experiences with at least one photo
        const validExperiences = (Array.isArray(response.data) ? response.data : []).filter(
          (exp) => exp.photos && exp.photos.length > 0
        );

        setExperiences(validExperiences);
      } catch (error) {
        console.error("Error fetching experiences:", error);
        setExperiences([]); // Prevent crash
      }
    }

    fetchExperiences();
  }, []);

  return (
    <div className="landing-page">
      <section id="Events">
        <Title order={1} mb="lg" style={{ marginBottom: '30px', paddingTop: '30px' }}>
          Browse Experiences
        </Title>
        <Container>
          <Grid justify="center">
            {experiences.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '18px' }}>
                No experiences available.
              </p>
            ) : (
              experiences.map((card) =>
                card.number_of_guests !== 0 && (
                  <Grid.Col key={card.id} span={4}>
                    <Link to={`/experience/${card.id}`} style={{ textDecoration: 'none' }}>
                      <CardItem
                        title={card.title}
                        description={card.description}
                        imageUrl={card.photos?.[0] ?? ""}
                        available={Math.max( 0,
                          (card.number_of_guests ?? 2) -
                          (card.number_of_bookings ?? 0))
                        } 
                      />
                    </Link>
                  </Grid.Col>
                )
              )
            )}
          </Grid>
        </Container>
      </section>
    </div>
  );
}
