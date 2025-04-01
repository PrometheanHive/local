import React from 'react';
import { SingleExperienceView } from '@/components/SingleExperienceView/SingleExperienceView';

const exampleExperience = {
  id: 1,
  photos: ['https://media.gettyimages.com/id/673024209/photo/sunrise-over-boulder-from-second-flatiron.jpg?s=612x612&w=0&k=20&c=WYY1s1CV7xfz9dRh9GsISrvZBM4YCbsuo1WG-8Mt2gk=',
    'https://media.gettyimages.com/id/1223232576/photo/view-from-chautauqua-trailhead-in-boulder-colorado-with-hikers-on-the-trail-with-the.jpg?s=612x612&w=0&k=20&c=GBozgXiYRWsJKBOGmpUKu3mA0ZSM83TgM53SnW_xA9c=',
    'https://media.gettyimages.com/id/165697561/photo/boulder-colorado-flatirons.jpg?s=612x612&w=0&k=20&c=_y_9TwcIFhnuNxfztZu-jZTkm2TEKjw1FXP-PDuX92o='],
  description: "This is a wonderful experience that you'll never forget. Come and enjoy the adventure!",
  unique_aspect: "John is the first person to ever hike in Boulder",
  title: "Go on a hike - title",
  price: 9,
  number_of_guests: 4,
  number_of_bookings: 2,  // ✅ <-- ADD THIS
  host_first_name: "John",
  host_last_name: "Doe",  // ✅ <-- ADD THIS
  host: {
    name: "John Doe",
    description: "...",
    photo: "data:image/jpeg;base64,..."
  },
  availableDates: [
    "2023-07-01",
    "2023-07-15",
    "2023-08-05"
  ],
  reviews: [
    { text: "This was an amazing experience!", rating: 5 },
    { text: "Highly recommend to anyone visiting the area.", rating: 4 }
  ],
  occurence_date: "2023-07-01",
  location: "Boulder, Colorado"
};


export function NoDataPullExperienceView() {
  return <SingleExperienceView experienceData={exampleExperience} />;
}

