// Your Firebase configuration (from Step 2)
const firebaseConfig = {
    apiKey: "AIzaSyDQ4TXYzg12eryWDnovWPCqUxfSOZWQIck",
    authDomain: "yoyolinks-d64c6.firebaseapp.com",
    projectId: "yoyolinks-d64c6",
    storageBucket: "yoyolinks-d64c6.firebasestorage.app",
    messagingSenderId: "135608837798",
    appId: "1:135608837798:web:a7ab3bff6f03756f413667",
    measurementId: "G-VPXQSWWF9B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
