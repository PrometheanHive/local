import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const loadGoogleMaps = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject('Failed to load Google Maps');
    document.head.appendChild(script);
  });
};

loadGoogleMaps().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}).catch((err) => {
  console.error('Google Maps script failed to load:', err);
});
