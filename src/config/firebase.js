import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import {
	connectAuthEmulator,
	getAuth,
	GoogleAuthProvider,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Firebase config using env vars
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
	messagingSenderId: '177990601301',
	appId: '1:177990601301:web:ecbe459a5031449eb8e2dc',
	measurementId: 'G-J4M8SENQHL',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics only in production
export const analytics =
	import.meta.env.MODE === 'production' && typeof window !== 'undefined'
		? getAnalytics(app)
		: null;

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Emulators (only if VITE_ENABLE_EMULATORS is true and in dev)
if (
	import.meta.env.MODE === 'development' &&
	import.meta.env.VITE_ENABLE_EMULATORS === 'true' &&
	typeof window !== 'undefined'
) {
	try {
		connectAuthEmulator(auth, 'http://localhost:9099', {
			disableWarnings: true,
		});
		connectFirestoreEmulator(db, 'localhost', 8080);
		connectStorageEmulator(storage, 'localhost', 9199);
	} catch (error) {
		console.warn('Emulator connection failed:', error);
	}
}

// Firebase utilities
export const firebaseUtils = {
	formatAuthError: (error) => {
		switch (error.code) {
			case 'auth/user-not-found':
				return 'No account found with this email address';
			case 'auth/wrong-password':
				return 'Incorrect password';
			case 'auth/invalid-email':
				return 'Invalid email address';
			case 'auth/too-many-requests':
				return 'Too many failed attempts. Please try again later';
			case 'auth/network-request-failed':
				return 'Network error. Please check your connection';
			case 'auth/popup-closed-by-user':
				return 'Sign-in was cancelled';
			case 'auth/popup-blocked':
				return 'Popup was blocked. Please enable popups and try again';
			default:
				return 'Authentication failed. Please try again';
		}
	},

	isAuthenticated: () => auth.currentUser !== null,

	getCurrentUserToken: async () => {
		if (auth.currentUser) {
			return await auth.currentUser.getIdToken();
		}
		return null;
	},

	signOut: async () => {
		try {
			await auth.signOut();
			return true;
		} catch (error) {
			console.error('Sign out error:', error);
			return false;
		}
	},
};

export default app;
