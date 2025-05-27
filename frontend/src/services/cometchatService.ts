import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit, UIKitSettingsBuilder } from '@cometchat/chat-uikit-react';

const COMETCHAT_CONSTANTS = {
  APP_ID: import.meta.env.VITE_COMETCHAT_APP_ID,
  REGION: import.meta.env.VITE_COMETCHAT_REGION,
  AUTH_KEY: import.meta.env.VITE_COMETCHAT_AUTH_KEY,
};

/**
 * Sanitizes an email address into a UID usable by CometChat.
 * Replaces "@" and "." with empty strings.
 */
export function sanitizeEmailToUID(email: string): string {
  return email.replace(/[@.]/g, '');
}

/**
 * Creates a user in CometChat using the sanitized UID and full name.
 */
export async function createUserFromEmail(email: string, firstName: string) {
  try { 
    const uid = sanitizeEmailToUID(email);
    const user = new CometChat.User(uid);
    user.setName(firstName);
    console.log('user:', user);
    console.log('Attempting CometChat user creation');
    await CometChat.createUser(user, COMETCHAT_CONSTANTS.AUTH_KEY);
    console.log('✅ CometChat user created');
  } catch (error) {console.log('❌ CometChat user creation failed');}
}

/**
 * Logs a user into CometChat using their sanitized UID.
 */
export async function loginUserByEmail(email: string) {
  console.log('Attempting CometChat login');

  const uid = sanitizeEmailToUID(email);
  try {
    const user = await CometChat.login(uid, COMETCHAT_CONSTANTS.AUTH_KEY);
    console.log('✅ CometChat login successful:', user);
  } catch (error) {
    console.error('❌ CometChat login failed:', error);
    throw error;
  }
}

/**
 * Logs the user out of CometChat.
 */
export async function logoutCometChatUser() {
  try {
    await CometChat.logout();
    console.log('✅ CometChat logout successful');
  } catch (error) {
    console.error('❌ CometChat logout failed:', error);
    throw error;
  }
}


let isInitialized = false;

export async function initializeCometChatUIKit() {
  if (isInitialized) return;
  const settings = new UIKitSettingsBuilder()
    .setAppId(COMETCHAT_CONSTANTS.APP_ID)
    .setRegion(COMETCHAT_CONSTANTS.REGION)
    .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
    .subscribePresenceForAllUsers()
    .build();

  await CometChatUIKit.init(settings);
  isInitialized = true;
  console.log("✅ CometChat UIKit initialized");
}