import React from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import { Container, Title, Grid, Text, Badge, Group, Stack } from '@mantine/core';

interface Experience {
  id: number;
  title: string;
  description: string;
  photos?: string[];
  number_of_guests: number;
  number_of_bookings?: number;
  occurence_date?: string;
  location?: string;
  tags?: string[];
}

export function LandingPage() {
  const [experiences, setExperiences] = React.useState<Experience[]>([]);

  React.useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await Api.instance.get<Experience[]>(`${API_BASE}/general/event/get_all`);
        console.log("API Response:", response.data);

        const validExperiences = (Array.isArray(response.data) ? response.data : []).filter(
          (exp) => exp.photos && exp.photos.length > 0
        );

        setExperiences(validExperiences);
      } catch (error) {
        console.error("Error fetching experiences:", error);
        setExperiences([]);
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
          <Grid justify="center" gutter="md">
            {experiences.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '18px' }}>
                No experiences available.
              </p>
            ) : (
              experiences.map((card) => {
                if (card.number_of_guests === 0) return null;
                const available = Math.max(0, (card.number_of_guests ?? 2) - (card.number_of_bookings ?? 0));
                const date = card.occurence_date ? new Date(card.occurence_date).toLocaleDateString() : null;

                return (
                  <Grid.Col key={card.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Link to={`/experience/${card.id}`} style={{ textDecoration: 'none' }}>
                      <CardItem
                        title={card.title}
                        description={card.description}
                        imageUrl={card.photos?.[0] ?? ""}
                        available={available}
                      >
                        <Stack mt="xs" gap="xs">
                          {date && <Text size="sm">📅 {date}</Text>}
                          {card.location && <Text size="sm">📍 {card.location}</Text>}
                          {card.tags && card.tags.length > 0 && (
                            <Group gap="xs">
                              {card.tags.map((tag, idx) => (
                                <Badge key={idx} size="xs" color="blue" variant="light">{tag}</Badge>
                              ))}
                            </Group>
                          )}
                        </Stack>
                      </CardItem>
                    </Link>
                  </Grid.Col>
                );
              })
            )}
          </Grid>
        </Container>
      </section>
    </div>
  );
}