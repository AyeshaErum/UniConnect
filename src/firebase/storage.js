import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage'
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

export function uploadMessageFile(convId, file, onProgress) {
  const ext      = file.name.split('.').pop()
  const unique   = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const storageRef = ref(storage, `messages/${convId}/${unique}`)
  const task     = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snap => onProgress && onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({
          url,
          name:    file.name,
          type:    file.type,
          size:    file.size,
          msgType: file.type.startsWith('image/') ? 'image' : 'file',
        })
      }
    )
  })
}
