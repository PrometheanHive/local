import axios from 'axios';

export const API_BASE = "https://" + document.location.hostname + ":5000/api";


class Api {
  static instance = axios.create();

  static updateSessionID(sessionId) {
    console.log("Session ID updated.");
    this.instance.defaults.headers.common['X-Session-ID'] = sessionId;
  }

  static getSessionID() {
    return this.instance.defaults.headers.common['X-Session-ID']
  }

  static setProjectID(projectId){
    console.log('project id updated');
    this.instance.defaults.headers.common['Project-ID'] = projectId;
  }

  static getProjectID(){
    return this.instance.defaults.headers.common['Project-ID']
  }

}

// API.defaults.baseURLS 

export default Api;