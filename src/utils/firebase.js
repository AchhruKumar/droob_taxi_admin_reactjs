// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCQw-TkkJSEKmtnzOeAcj4LlRrNPSU-rCY",
  authDomain: "droobtaxi-588fc.firebaseapp.com",
  projectId: "droobtaxi-588fc",
  messagingSenderId: "23234143934",
  appId: "1:23234143934:web:a82f3bd8dc64217d3da0ef"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

let fcmTokenCache = null;
let isFetchingToken = false;

export const requestForToken = async (registration) => {
  try {
    // ✅ If already fetched → return cached
    if (fcmTokenCache) {
      return fcmTokenCache;
    }

    // ✅ Prevent parallel calls
    if (isFetchingToken) {
      return null;
    }

    isFetchingToken = true;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permission not granted for notifications");
      isFetchingToken = false;
      return null;
    }
  
    const token = await getToken(messaging, {
      vapidKey: "BFNyjKi_8ghFohgQKcxy04lqAwNQ9pA9rXVd4H6bXr4KIAEThQx4hQwKGvBlVE2eECMShW06K2eQHKt3m79NAQY",
      serviceWorkerRegistration: registration,
    });

    // ✅ Save token
    fcmTokenCache = token;
    isFetchingToken = false;
    return token;
  } catch (err) {
    isFetchingToken = false;
    console.error("Error retrieving token:", err);
    return null;
  }
};