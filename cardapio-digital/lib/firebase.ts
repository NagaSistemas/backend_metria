import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "AIzaSyD9VBu3IAyRWitlR4hPejhC9s-J57AH82Q",
  authDomain: "metria-fcbbc.firebaseapp.com",
  projectId: "metria-fcbbc",
  storageBucket: "metria-fcbbc.firebasestorage.app",
  messagingSenderId: "55755848255",
  appId: "1:55755848255:web:2ac180e2ed3c83d714168a",
  measurementId: "G-6RWF3VHSTG"
}

const app = initializeApp(firebaseConfig)

// Auth
export const auth = getAuth(app)

// Firestore
export const db = getFirestore(app)

// Messaging
let messaging: any = null
if (typeof window !== 'undefined') {
  messaging = getMessaging(app)
}

export const requestNotificationPermission = async () => {
  if (!messaging) return null
  
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BJQiRteKzQc1S8MLWq0DR_niTiKoVCD0nDQd58I4USHgzqRgo4ZfQ97HmgVqema4VRJX2s6NRBN3Ob6DPso_O9w"
      })
      
      // Salvar token no backend
      await fetch('http://localhost:3001/api/notifications/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      return token
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error)
  }
  return null
}

// Auth Functions
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Buscar dados do usuário no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userData = userDoc.data()
    
    return {
      uid: user.uid,
      email: user.email,
      role: userData?.role || 'client',
      restaurantId: userData?.restaurantId || null,
      name: userData?.name || user.email?.split('@')[0]
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const registerUser = async (email: string, password: string, name: string, role: string = 'kitchen', restaurantId?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Salvar dados do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role,
      restaurantId: restaurantId || null,
      createdAt: new Date().toISOString()
    })
    
    return {
      uid: user.uid,
      email: user.email,
      role,
      restaurantId,
      name
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        
        resolve({
          uid: user.uid,
          email: user.email,
          role: userData?.role || 'kitchen',
          restaurantId: userData?.restaurantId || null,
          name: userData?.name || user.email?.split('@')[0]
        })
      } else {
        resolve(null)
      }
      unsubscribe()
    })
  })
}

export const onMessageListener = () => {
  if (!messaging) return Promise.resolve()
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
}