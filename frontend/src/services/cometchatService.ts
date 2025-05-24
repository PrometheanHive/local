import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";


interface CreateChatUserParams {
  email: string;
  firstName: string;
  lastName: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

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


export async function createCometChatUserAndLogin({
  email,
  firstName,
  lastName,
  onSuccess,
  onError
}: CreateChatUserParams) {
  try {
    const uid = email.replace(/[@.]/g, "");
    await initializeCometChat();

    const chatUser = new CometChat.User(uid);
    chatUser.setName(`${firstName} ${lastName}`);

    try {
      await CometChatUIKit.createUser(chatUser);
      console.log("✅ CometChat user created");
    } catch (err: any) {
      if (err?.code === "ERR_UID_ALREADY_EXISTS") {
        console.warn("⚠️ CometChat user already exists, continuing to login");
      } else {
        throw err;
      }
    }

    await CometChat.login(uid, import.meta.env.VITE_COMETCHAT_AUTH_KEY);
    console.log("✅ CometChat login successful");

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("❌ CometChat user creation/login failed:", error);
    if (onError) onError(error);
  }
}
