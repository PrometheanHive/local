import axios from 'axios';

// Ensure API_BASE uses HTTPS and does NOT include port 5000
export const API_BASE =
  window.location.hostname === "demo.experiencebylocals.com"
    ? "https://demo.experiencebylocals.com/api"  // Use ALB in production
    : "http://backend:5000/api";  // Keep localhost for development

// Create an Axios instance with default settings
const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,  // Ensures cookies & authentication tokens work
  timeout: 5000,  // Increase timeout to 5s to handle longer API responses
  headers: {
    'Content-Type': 'application/json',
  },
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

  // **Centralized API Request Method**
  static async request(
    method: "get" | "post" | "put" | "delete",
    url: string,
    data?: any
  ) {
    try {
      const response = await this.instance.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Request Error: ${error.message}`, error);

      // 🔹 Handle Unauthorized (401) Responses
      if (error.response?.status === 401) {
        console.warn("Unauthorized request! Redirecting to login...");
        window.location.href = "/sign-in"; // Redirect guest users to login page
      }

      throw error;
    }
  }
}

export default Api;
