// src/types/UserTypes.ts
export interface User {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    profile_pic?: string;
    is_host?: boolean;
    is_traveler?: boolean;
  }
  