import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updatePassword,
  deleteUser,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from './config'
import { createUserProfile } from './firestore'

const googleProvider = new GoogleAuthProvider()

export async function signUpWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await createUserProfile(cred.user.uid, { name: displayName, email })
  return cred.user
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  await createUserProfile(cred.user.uid, {
    name:     cred.user.displayName,
    email:    cred.user.email,
    photoURL: cred.user.photoURL,
  })
  return cred.user
}

export async function logout() {
  await signOut(auth)
}

export async function changePassword(newPassword) {
  if (!auth.currentUser) throw new Error('Not authenticated')
  await updatePassword(auth.currentUser, newPassword)
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

export async function deleteAccount() {
  if (!auth.currentUser) throw new Error('Not authenticated')
  await deleteUser(auth.currentUser)
}
