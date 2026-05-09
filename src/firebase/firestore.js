import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query, where,
  orderBy, limit, onSnapshot, arrayUnion, arrayRemove,
  increment, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './config'

// ── Users ──────────────────────────────────────────────────────────────────

export async function createUserProfile(uid, data) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return // don't overwrite on re-login
  await setDoc(ref, {
    name:         data.name || '',
    email:        data.email || '',
    photoURL:     data.photoURL || '',
    bio:          '',
    university:   '',
    major:        '',
    year:         '',
    teachSkills:  [],
    learnSkills:  [],
    availability: 'Open to connect',
    connections:  [],
    createdAt:    serverTimestamp(),
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Connections ────────────────────────────────────────────────────────────

export async function sendConnectionRequest(fromId, toId) {
  await updateDoc(doc(db, 'users', fromId), { connections: arrayUnion(toId) })
  await addDoc(collection(db, `notifications/${toId}/items`), {
    type:      'connection_request',
    message:   'sent you a connection request.',
    relatedId: fromId,
    read:      false,
    createdAt: serverTimestamp(),
  })
}

export async function removeConnection(fromId, toId) {
  await updateDoc(doc(db, 'users', fromId), { connections: arrayRemove(toId) })
}

// ── Help Posts ─────────────────────────────────────────────────────────────

export async function createHelpPost(data) {
  return addDoc(collection(db, 'helpPosts'), {
    ...data,
    upvotes:   0,
    resolved:  false,
    createdAt: serverTimestamp(),
  })
}

export async function getHelpPosts(tag = null) {
  let q = tag
    ? query(collection(db, 'helpPosts'), where('tags', 'array-contains', tag), orderBy('createdAt', 'desc'))
    : query(collection(db, 'helpPosts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeHelpPosts(callback) {
  const q = query(collection(db, 'helpPosts'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function upvoteHelpPost(postId) {
  await updateDoc(doc(db, 'helpPosts', postId), { upvotes: increment(1) })
}

export async function resolveHelpPost(postId) {
  await updateDoc(doc(db, 'helpPosts', postId), { resolved: true })
}

export async function deleteHelpPost(postId) {
  await deleteDoc(doc(db, 'helpPosts', postId))
}

export async function addReply(postId, data) {
  const ref = await addDoc(collection(db, `helpPosts/${postId}/replies`), {
    ...data,
    upvotes:   0,
    createdAt: serverTimestamp(),
  })
  return ref
}

export async function getReplies(postId) {
  const snap = await getDocs(
    query(collection(db, `helpPosts/${postId}/replies`), orderBy('createdAt', 'asc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeReplies(postId, callback) {
  const q = query(
    collection(db, `helpPosts/${postId}/replies`),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function upvoteReply(postId, replyId) {
  await updateDoc(doc(db, `helpPosts/${postId}/replies`, replyId), {
    upvotes: increment(1),
  })
}

// ── Events ─────────────────────────────────────────────────────────────────

export async function createEvent(data) {
  return addDoc(collection(db, 'events'), {
    ...data,
    attendees: [],
    createdAt: serverTimestamp(),
  })
}

export function subscribeEvents(callback) {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function rsvpEvent(eventId, userId) {
  await updateDoc(doc(db, 'events', eventId), { attendees: arrayUnion(userId) })
}

export async function unrsvpEvent(eventId, userId) {
  await updateDoc(doc(db, 'events', eventId), { attendees: arrayRemove(userId) })
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, 'events', eventId))
}

// ── Mentorship ─────────────────────────────────────────────────────────────

export async function createMentorshipSlot(data) {
  return addDoc(collection(db, 'mentorshipSlots'), {
    ...data,
    status:      'Open',
    requestedBy: null,
    createdAt:   serverTimestamp(),
  })
}

export function subscribeMentorshipSlots(callback) {
  const q = query(collection(db, 'mentorshipSlots'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function requestMentorshipSlot(slotId, studentId, mentorId) {
  await updateDoc(doc(db, 'mentorshipSlots', slotId), {
    status:      'Booked',
    requestedBy: studentId,
  })
  await addDoc(collection(db, `notifications/${mentorId}/items`), {
    type:      'mentorship_request',
    message:   'requested your mentorship slot.',
    relatedId: studentId,
    read:      false,
    createdAt: serverTimestamp(),
  })
}

export async function deleteMentorshipSlot(slotId) {
  await deleteDoc(doc(db, 'mentorshipSlots', slotId))
}

// ── Messages ───────────────────────────────────────────────────────────────

export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

export async function getOrCreateConversation(uid1, uid2) {
  const convId = getConversationId(uid1, uid2)
  const ref = doc(db, 'messages', convId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { participants: [uid1, uid2], createdAt: serverTimestamp() })
  }
  return convId
}

export async function getUserConversations(uid) {
  const snap = await getDocs(
    query(collection(db, 'messages'), where('participants', 'array-contains', uid))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeConversations(uid, callback) {
  const q = query(collection(db, 'messages'), where('participants', 'array-contains', uid))
  return onSnapshot(q, snap => {
    const convos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    convos.sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0))
    callback(convos)
  })
}

export function subscribeMessages(convId, callback) {
  const q = query(
    collection(db, `messages/${convId}/msgs`),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function sendMessage(convId, senderId, content, file = null) {
  const msgData = {
    senderId,
    content:   content || '',
    read:      false,
    msgType:   file ? file.msgType : 'text',
    createdAt: serverTimestamp(),
  }
  if (file) {
    msgData.fileUrl  = file.url
    msgData.fileName = file.name
    msgData.fileType = file.type
    msgData.fileSize = file.size
  }

  await addDoc(collection(db, `messages/${convId}/msgs`), msgData)
  await updateDoc(doc(db, 'messages', convId), {
    lastMessage:   file ? `📎 ${file.name}` : content,
    lastMessageAt: serverTimestamp(),
    lastSenderId:  senderId,
  })
}

export async function markMessagesRead(convId, userId) {
  const snap = await getDocs(
    query(
      collection(db, `messages/${convId}/msgs`),
      where('read', '==', false),
      where('senderId', '!=', userId)
    )
  )
  const batch = snap.docs.map(d => updateDoc(d.ref, { read: true }))
  await Promise.all(batch)
}

// ── Notifications ──────────────────────────────────────────────────────────

export function subscribeNotifications(uid, callback) {
  const q = query(
    collection(db, `notifications/${uid}/items`),
    orderBy('createdAt', 'desc'),
    limit(30)
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function markNotificationRead(uid, notifId) {
  await updateDoc(doc(db, `notifications/${uid}/items`, notifId), { read: true })
}

export async function markAllNotificationsRead(uid) {
  const snap = await getDocs(
    query(collection(db, `notifications/${uid}/items`), where('read', '==', false))
  )
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })))
}

// ── Success Stories ────────────────────────────────────────────────────────

export async function createSuccessStory(data) {
  return addDoc(collection(db, 'successStories'), {
    ...data,
    likes:     [],
    createdAt: serverTimestamp(),
  })
}

export function subscribeSuccessStories(callback) {
  const q = query(collection(db, 'successStories'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function toggleLikeStory(storyId, userId, liked) {
  await updateDoc(doc(db, 'successStories', storyId), {
    likes: liked ? arrayRemove(userId) : arrayUnion(userId),
  })
}

export async function deleteSuccessStory(storyId) {
  await deleteDoc(doc(db, 'successStories', storyId))
}

// ── Masterclasses ──────────────────────────────────────────────────────────

export async function createMasterclass(data) {
  return addDoc(collection(db, 'masterclasses'), {
    ...data,
    scheduledAt: Timestamp.fromDate(data.scheduledAt instanceof Date ? data.scheduledAt : new Date(data.scheduledAt)),
    createdAt:   serverTimestamp(),
  })
}

export function subscribeMasterclasses(callback) {
  const q = query(collection(db, 'masterclasses'), orderBy('scheduledAt', 'asc'))
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export async function deleteMasterclass(classId) {
  await deleteDoc(doc(db, 'masterclasses', classId))
}

export async function getTutors() {
  const snap = await getDocs(query(collection(db, 'users'), where('isTutor', '==', true)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Leaderboard ────────────────────────────────────────────────────────────

export async function getLeaderboard() {
  const [postsSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, 'helpPosts')),
    getDocs(collection(db, 'users')),
  ])

  const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // tally upvotes received per user
  const scores = {}
  posts.forEach(p => {
    scores[p.authorId] = (scores[p.authorId] || 0) + (p.upvotes || 0)
  })

  return users
    .map(u => ({ ...u, score: scores[u.id] || 0 }))
    .sort((a, b) => b.score - a.score)
}
