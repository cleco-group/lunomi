// firebase-config.js
// Menggunakan Firebase v10 Compat untuk mendukung file HTML tanpa build tool (tanpa type="module")
const firebaseConfig = {
  apiKey: "AIzaSyAhLDYRAkybW71ogrHJ_DnNDKAUaHvkVfc",
  authDomain: "lunomi-fb157.firebaseapp.com",
  projectId: "lunomi-fb157",
  storageBucket: "lunomi-fb157.firebasestorage.app",
  messagingSenderId: "116209020691",
  appId: "1:116209020691:web:3a07c06c33eca9640df4e6",
  measurementId: "G-Y2NWYVM0QY"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
window.db = db; // Expose globally
