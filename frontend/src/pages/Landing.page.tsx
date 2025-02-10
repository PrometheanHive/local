import React from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import { Title } from '@mantine/core';

export function LandingPage() {
    const [experiences, setExperiences] = React.useState([]);
    const [apiError, setApiError] = React.useState(false);

    React.useEffect(() => {
        if (experiences.length === 0) {
            fetchExperiences();
        }
    }, [experiences]);

    async function fetchExperiences() {
        try {
            const response = await Api.instance.get(`${API_BASE}/general/event/get_all`);
            setExperiences(Array.isArray(response.data) ? response.data : []);
            setApiError(false);
        } catch (error) {
            console.error("Error fetching experiences:", error);
            setApiError(true);
            setExperiences([]);
        }
    }

    return (
        <div className="landing-page">
            <section id="Events">
                <Title order={1} align="center" style={{ marginBottom: '30px', paddingTop: "30px" }}>
                    Browse Experiences
                </Title>

                {apiError && (
                    <p style={{ textAlign: 'center', fontSize: '18px', color: 'red' }}>
                        Unable to load experiences. Please try again later.
                    </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                    {Array.isArray(experiences) && experiences.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '18px' }}>No experiences available.</p>
                    ) : (
                        Array.isArray(experiences) &&
                        experiences.map((card, index) =>
                            card.number_of_guests !== 0 && (
                                <div key={index} style={{ width: '300px', marginBottom: '20px' }}>
                                    <Link to={`/experience/${card.id}`} style={{ textDecoration: "none" }}>
                                        <CardItem
                                            title={card.title}
                                            description={card.description}
                                            imageUrl={card.photos?.[0] || "https://via.placeholder.com/300"}
                                            available={card.number_of_guests - (card.number_of_bookings || 0)}
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
