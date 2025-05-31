// src/utils/loadFacebookSDK.ts

declare global {
    interface Window {
      fbAsyncInit: () => void;
      FB: any;
    }
  }
  
  export function loadFacebookSDK(): Promise<void> {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    return new Promise((resolve) => {
      if (window.FB) return resolve();
  
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
        resolve();
      };
  
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    });
  }
  