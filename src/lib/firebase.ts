import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential, OAuthCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkUhAyBcvX0NPpQjYRuQU-_vcIQB2jP-o",
  authDomain: "smart-split-828c5.firebaseapp.com",
  projectId: "smart-split-828c5",
  storageBucket: "smart-split-828c5.firebasestorage.app",
  messagingSenderId: "765128766308",
  appId: "1:765128766308:web:f03c9498d7bd6a6503c071",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

/** Exchange Google GSI credential → Firebase ID token */
export async function getFirebaseIdTokenFromGoogleCredential(googleJwt: string): Promise<string> {
  const credential: OAuthCredential = GoogleAuthProvider.credential(googleJwt);
  const result = await signInWithCredential(auth, credential);
  return result.user.getIdToken();
}
