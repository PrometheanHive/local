import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

const COMETCHAT_CONSTANTS = {
  APP_ID: "254033c3e0be6dd7", // Replace with your App ID
  REGION: "US", // Replace with your App Region
  AUTH_KEY: "f668b6beca8d497ea2d81d30360e412e1ebb9244" // Replace with your Auth Key
};

// Ensure COMETCHAT_CONSTANTS has valid values
if (COMETCHAT_CONSTANTS.APP_ID && COMETCHAT_CONSTANTS.REGION && COMETCHAT_CONSTANTS.AUTH_KEY) {
  // Create the builder
  const UIKitSettings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForFriends()
    .build();

  // Check if UIKitSettings is valid before initializing
  if (UIKitSettings) {
    CometChatUIKit.init(UIKitSettings)
      .then(() => {
        console.log("Initialization completed successfully");
        // You can now call login function.
        CometChatUIKit.getLoggedinUser();
      })
      .catch(console.log);
  } else {
    console.error("CometChatUIKit settings failed to initialize.");
  }
} else {
  console.error("CometChat constants are missing or invalid.");
}

// Ensure 'root' element exists before rendering React
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} else {
  console.error("Root element not found!");
}
