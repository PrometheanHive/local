import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // <-- put in your .env

export default function App() {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <MantineProvider theme={theme}>
        <Router />
      </MantineProvider>
    </LoadScript>
  );
}
