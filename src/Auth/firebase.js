
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMhNHX6CPR7ZILisfuX-Nt2RoHH2t-iDE",
  authDomain: "exam-99519.firebaseapp.com",
  projectId: "exam-99519",
  storageBucket: "exam-99519.firebasestorage.app",
  messagingSenderId: "869382357694",
  appId: "1:869382357694:web:0e61043d43aa8372d394ef",
  measurementId: "G-Z1HN7SF4QL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics };