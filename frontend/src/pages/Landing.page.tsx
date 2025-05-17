import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import {
  Container,
  Title,
  Grid,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Drawer
} from '@mantine/core';
import { EventFilterBar } from '../components/EventFilterBar/EventFilterBar';

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
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [queryParams, setQueryParams] = useState<URLSearchParams>(new URLSearchParams());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<URLSearchParams>(new URLSearchParams());

  const fetchExperiences = async (params: URLSearchParams) => {
    try {
      const response = await Api.instance.get<Experience[]>(`${API_BASE}/general/event/get_all?${params.toString()}`);
      const validExperiences = (Array.isArray(response.data) ? response.data : []).filter(
        (exp) => exp.photos && exp.photos.length > 0
      );
      setExperiences(validExperiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setExperiences([]);
    }
  };

  useEffect(() => {
    fetchExperiences(queryParams);
  }, [queryParams]);

  const handleApplyFilters = (params: URLSearchParams) => {
    setQueryParams(params);
    setFilterState(new URLSearchParams(params));
    setDrawerOpen(false);
  };

  const handleClearFilters = () => {
    const cleared = new URLSearchParams();
    setQueryParams(cleared);
    setFilterState(cleared);
  };

  return (
    <div className="landing-page">
      <section id="Events">
        <Group justify="space-between" align="center" mb="md">
          <Title order={1}>Browse Experiences</Title>
          <Button onClick={() => setDrawerOpen(true)}>Open Filters</Button>
        </Group>

        <Drawer
          opened={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filter Experiences"
          padding="md"
          size="md"
          position="left"
        >
          <EventFilterBar
            onFilterChange={handleApplyFilters}
            initialParams={filterState}
            onClear={handleClearFilters}
          />
        </Drawer>

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
