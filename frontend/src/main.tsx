// main.tsx
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initializeCometChatUIKit } from './services/cometchatService'; // ✅ Import this

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const loadGoogleMaps = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&v=beta`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject('Failed to load Google Maps');
    document.head.appendChild(script);
  });
};

Promise.all([loadGoogleMaps(), initializeCometChatUIKit()])
  .then(() => {
    console.log('✅ Google Maps and CometChat UIKit initialized');
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <GoogleOAuthProvider clientId={clientId}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    );
  })
  .catch((err) => {
    console.error('❌ Initialization failed:', err);
  });
