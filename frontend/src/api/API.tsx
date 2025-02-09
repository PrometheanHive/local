import axios from 'axios';

// Ensure API_BASE uses HTTPS and does NOT include port 5000
export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://demo.experiencebylocals.com/api"  //  Production API (No Port 5000)
    : "http://localhost:5000/api";  //  Local Development

// Create an Axios instance with default settings
const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,  //  Ensures cookies & authentication tokens work
  headers: {
    'Content-Type': 'application/json'
  }
});

class Api {
  static instance = instance;

  static updateSessionID(sessionId: string) {
    console.log("Session ID updated:", sessionId);
    this.instance.defaults.headers.common['X-Session-ID'] = sessionId;
  }

  static getSessionID(): string | undefined {
    return this.instance.defaults.headers.common['X-Session-ID'];
  }

  static setProjectID(projectId: string) {
    console.log('Project ID updated:', projectId);
    this.instance.defaults.headers.common['Project-ID'] = projectId;
  }

  static getProjectID(): string | undefined {
    return this.instance.defaults.headers.common['Project-ID'];
  }

  // Centralized Error Handling for API Requests
  static async request(method: "get" | "post" | "put" | "delete", url: string, data?: any) {
    try {
      const response = await this.instance.request({ method, url, data });
      return response.data;
    } catch (error: any) {
      console.error(`API Request Error: ${error.message}`, error);
      throw error;
    }
  }
}

export default Api;
