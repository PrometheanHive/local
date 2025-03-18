import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";
import { UIKitSettingsBuilder } from "@cometchat/uikit-shared";

// CometChat Constants
const COMETCHAT_CONSTANTS = {
  APP_ID: "254033c3e0be6dd7",
  REGION: "US",
  AUTH_KEY: "f668b6beca8d497ea2d81d30360e412e1ebb9244",
};

// Initialize CometChat
const initializeCometChat = async () => {
  try {
    console.log(" Initializing CometChat...");
    
    const UIKitSettings = new UIKitSettingsBuilder()
      .setAppId(COMETCHAT_CONSTANTS.APP_ID)
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .subscribePresenceForFriends()
      .build();

    await CometChatUIKit.init(UIKitSettings);
    console.log(" CometChat Initialized Successfully");

    const loggedInUser = await CometChatUIKit.getLoggedinUser();
    if (loggedInUser) {
      console.log(" CometChat User Already Logged In:", loggedInUser);
    } else {
      console.warn(" No user logged in yet.");
    }
  } catch (error) {
    console.error(" CometChat Initialization Failed:", error);
  }
};

// Call initialization before rendering React app
initializeCometChat().then(() => {
  // Ensure 'root' element exists before rendering React
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  } else {
    console.error(" Root element not found!");
  }
});
