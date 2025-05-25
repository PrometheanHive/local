import { CometChat } from '@cometchat/chat-sdk-javascript';

const authKey = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

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
    console.log('Attempting CometChat user creation');
    const user = new CometChat.User(uid);
    user.setName(firstName);

    await CometChat.createUser(user, authKey);
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
    const user = await CometChat.login(uid, authKey);
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
