export interface Review {
    text: string;
    rating: number;
  }
  
  export interface ExperienceData {
    id: number;
    title: string;
    description: string;
    unique_aspect: string;
    price: number | string;
    location: string;
    photos: string[];
    reviews: Review[];
    occurence_date: string;
    host_first_name: string;
  }
  