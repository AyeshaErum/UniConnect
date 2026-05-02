import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

export async function uploadProfilePhoto(uid, file) {
  const storageRef = ref(storage, `profiles/${uid}/avatar`)
  const snap = await uploadBytes(storageRef, file)
  return getDownloadURL(snap.ref)
}

export async function deleteProfilePhoto(uid) {
  try {
    await deleteObject(ref(storage, `profiles/${uid}/avatar`))
  } catch {
    // file may not exist — ignore
  }
}
