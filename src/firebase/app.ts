import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { firebaseConfig, firebaseIsConfigured } from './config'

const appInstance = firebaseIsConfigured ? initializeApp(firebaseConfig) : null

export const firebaseApp = appInstance
export const firebaseAuth = appInstance ? getAuth(appInstance) : null
export const firestoreDb = appInstance ? getFirestore(appInstance) : null
export const firebaseStorage = appInstance ? getStorage(appInstance) : null
