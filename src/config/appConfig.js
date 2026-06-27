// Application Configurations & Environments

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase setup exists. Fallback to LocalStorage mock database if any key is missing.
export const MOCK_MODE = !FIREBASE_CONFIG.apiKey || 
                         FIREBASE_CONFIG.apiKey === "PLACEHOLDER" || 
                         FIREBASE_CONFIG.apiKey.trim() === "";

export const RAZORPAY_CONFIG = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock_12345",
};
