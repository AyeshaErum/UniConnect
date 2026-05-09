import { logEvent } from 'firebase/analytics'
import { analyticsPromise } from '../firebase/config'

async function getAnalytics() {
  return analyticsPromise
}

export async function trackPageView(pageName) {
  const analytics = await getAnalytics()
  if (!analytics) return
  logEvent(analytics, 'page_view', { page_title: pageName, page_location: window.location.href })
}

export async function trackEvent(eventName, params = {}) {
  const analytics = await getAnalytics()
  if (!analytics) return
  logEvent(analytics, eventName, params)
}

// ── Named event helpers ──────────────────────────────────────────────────────

export const trackTranscriptUploaded = (courseCount, cGPA) =>
  trackEvent('transcript_uploaded', { course_count: courseCount, cgpa: cGPA })

export const trackTutorMessaged = (tutorId, courseSearched) =>
  trackEvent('tutor_messaged', { tutor_id: tutorId, course: courseSearched || 'none' })

export const trackMasterclassJoined = (classId, classTitle, topic) =>
  trackEvent('masterclass_joined', { class_id: classId, class_title: classTitle, topic })

export const trackHelpPostCreated = (tags) =>
  trackEvent('help_post_created', { tags: tags?.join(',') || '' })

export const trackProfileCompleted = (major, year) =>
  trackEvent('profile_completed', { major: major || '', year: year || '' })
