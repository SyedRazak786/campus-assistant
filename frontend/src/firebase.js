import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAVhwIvqDO7I8T0BLFw1SSKI1ikqpNFiMQ',
  authDomain: 'campus-assistant-5ac1b.firebaseapp.com',
  projectId: 'campus-assistant-5ac1b',
  storageBucket: 'campus-assistant-5ac1b.firebasestorage.app',
  messagingSenderId: '505461375751',
  appId: '1:505461375751:web:cb4f7527f2103333f6bba2',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
