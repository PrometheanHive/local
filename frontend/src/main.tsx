import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";

// Define CometChat Constants Safely
const COMETCHAT_CONSTANTS = {
  APP_ID: "254033c3e0be6dd7", // Replace with your App ID
  REGION: "US", // Replace with your App Region
  AUTH_KEY: "f668b6beca8d497ea2d81d30360e412e1ebb9244" // Replace with your Auth Key
};

// Ensure CometChat SDK is Loaded Before Proceeding
if (typeof CometChatUIKit !== "undefined" && COMETCHAT_CONSTANTS.APP_ID && COMETCHAT_CONSTANTS.REGION && COMETCHAT_CONSTANTS.AUTH_KEY) {
  try {
    // Create UIKitSettings Builder Safely
    const UIKitSettings = new UIKitSettingsBuilder()
      .setAppId(COMETCHAT_CONSTANTS.APP_ID)
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
      .subscribePresenceForFriends()
      .build();

    // Validate Settings Before Initializing
    if (UIKitSettings) {
      CometChatUIKit.init(UIKitSettings)
        .then(() => {
          console.log("CometChat Initialization Successful");
          return CometChatUIKit.getLoggedinUser();
        })
        .then(user => {
          console.log("CometChat User Logged In:", user);
        })
        .catch(error => {
          console.error("CometChat Initialization Failed:", error);
        });
    } else {
      console.error("CometChat UIKit settings could not be initialized.");
    }
  } catch (error) {
    console.error("CometChat Initialization Error:", error);
  }
} else {
  console.error("CometChat constants are missing or the SDK is not properly loaded.");
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
