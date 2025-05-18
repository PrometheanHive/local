export interface Review {
    text: string;
    rating: number;
  }
  
  export interface ExperienceData {
    id: number;
    title: string;
    description: string;
    unique_aspect: string;
    occurence_date: string;
    location: string;
    price: number | string;
    photos: string[];
    number_of_guests: number;
    number_of_bookings: number;
    reviews: Review[];
    host_first_name: string;
    host_last_name: string;
    host_profile_pic?: string;
    host_id?: number;
    tags?: string[]; 
  }
  
  