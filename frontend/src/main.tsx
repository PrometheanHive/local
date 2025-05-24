import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CometChatUIKit, UIKitSettingsBuilder } from '@cometchat/chat-uikit-react';

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const COMETCHAT_CONSTANTS = {
  APP_ID: import.meta.env.VITE_COMETCHAT_APP_ID,
  REGION: import.meta.env.VITE_COMETCHAT_REGION,
  AUTH_KEY: import.meta.env.VITE_COMETCHAT_AUTH_KEY,
};

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

const initializeCometChatUIKit = () => {
  const settings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    .build();

  return CometChatUIKit.init(settings);
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
