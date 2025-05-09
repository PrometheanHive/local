import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
const COMETCHAT_CONSTANTS = {
  APP_ID: import.meta.env.VITE_COMETCHAT_APP_ID,
  REGION: import.meta.env.VITE_COMETCHAT_REGION,
  AUTH_KEY: import.meta.env.VITE_COMETCHAT_AUTH_KEY
};


let initialized = false;

export async function initializeCometChat() {
    if (initialized) return;
    const settings = new UIKitSettingsBuilder()
      .setAppId(COMETCHAT_CONSTANTS.APP_ID)
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
      .subscribePresenceForFriends()
      .build();
  
    await CometChatUIKit.init(settings);
    initialized = true;
    console.log("✅ CometChat initialized");
  }
  
  export async function ensureCometChatLoggedIn(email: string) {
    await initializeCometChat();
    const uid = email.replace(/[@.]/g, "");
    const current = await CometChat.getLoggedinUser();
    if (!current || current.getUid() !== uid) {
      if (current) await CometChat.logout();
      await CometChat.login(uid);
      console.log(`✅ CometChat logged in as: ${uid}`);
    }
  }
