import React from 'react';
import { Link } from 'react-router-dom';
import { CardItem } from '../components/Cards/Card';
import Api, { API_BASE } from '@/api/API';
import { Container, Title, Grid, Col } from '@mantine/core'; 


export function LandingPage() {
  // Define card data as an array of objects
  const imageUrl = "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/6c/3f/ce.jpg";
  // Events on page eventually retrieve from backend
  const cards = [
    {
      title: "Cooking with Martha",
      description: "Join us for an authentic cooking class",
      imageUrl: "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/6c/3f/ce.jpg",
      available: 5
    },
    {
      title: "Hiking with John",
      description: "Come explore the flatirons with a hiking expert!",
      imageUrl: "https://www.colorado.edu/coloradan/sites/default/files/styles/large/public/article-image/chautauqua_flatirons.jpg?itok=__-aKYLk",
      available: 3
    },
    {
      title: "Hiking with John",
      description: "Come explore the flatirons with a hiking expert!",
      imageUrl: "https://www.colorado.edu/coloradan/sites/default/files/styles/large/public/article-image/chautauqua_flatirons.jpg?itok=__-aKYLk",
      available: 3
    },
    {
      title: "Hiking with John",
      description: "Come explore the flatirons with a hiking expert!",
      imageUrl: "https://www.colorado.edu/coloradan/sites/default/files/styles/large/public/article-image/chautauqua_flatirons.jpg?itok=__-aKYLk",
      available: 7
    },
    {
      title: "Hiking With John",
      description: "Come explore the flatirons with a hiking expert!",
      imageUrl: "https://www.colorado.edu/coloradan/sites/default/files/styles/large/public/article-image/chautauqua_flatirons.jpg?itok=__-aKYLk",
      available: 3
    },

  ];

  const [experiences, setExperiences] = React.useState([])
  React.useEffect(() => {
    Api.instance.get(`${API_BASE}/general/event/get_all`).then((response) => {
      console.log(response.data);
      setExperiences(response.data);
    });
  }, []);
  return (
    <div className="landing-page" /*style={{background: 'linear-gradient(to bottom, #0047AB	, #FFFFFF)'}}*/>
      <section id="Events">
        <Title order={1} align="center" style={{ marginBottom: '30px', paddingTop:"30px"}}>Browse Experiences</Title>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {/* Map over the cards array to render each card */}
          {experiences.map((card, index) => card.number_of_guests !== 0 && (
            <div key={index} style={{ width: '300px', marginBottom: '20px' }}>
              <Link to={`/experience/${card.id}`} style={{ textDecoration: "none" }}>
                <CardItem
                  title={card.title}
                  description={card.description}
                  imageUrl={card.photos[0]}
                  available={card.number_of_guests - card.number_of_bookings}
                />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
