import { db, auth } from '../firebase/config'
import {
  collection, addDoc, setDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'

const SEED_USERS = [
  {
    id: 'seed_alex',
    name: 'Alex Chen', email: 'alex@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    bio: 'CS junior passionate about ML and open source. Love helping others debug!',
    university: 'State University', major: 'Computer Science', year: '3rd Year',
    teachSkills: ['Python', 'Machine Learning', 'React'],
    learnSkills: ['Cybersecurity', 'Cloud'],
    availability: 'Open to mentoring', connections: [],
  },
  {
    id: 'seed_priya',
    name: 'Priya Sharma', email: 'priya@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    bio: 'Design student who loves turning ideas into beautiful products.',
    university: 'State University', major: 'Design', year: '2nd Year',
    teachSkills: ['UI/UX Design', 'Figma', 'Photography'],
    learnSkills: ['React', 'Web Development'],
    availability: 'Free this evening', connections: [],
  },
  {
    id: 'seed_marcus',
    name: 'Marcus Johnson', email: 'marcus@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    bio: 'Finance major & hackathon enthusiast. Can help with Excel & financial modeling.',
    university: 'State University', major: 'Finance', year: '4th Year',
    teachSkills: ['Finance', 'Excel', 'Project Management'],
    learnSkills: ['Python', 'Data Analysis'],
    availability: 'Available weekends', connections: [],
  },
  {
    id: 'seed_sara',
    name: 'Sara El-Amin', email: 'sara@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
    bio: 'PhD candidate in ML. Been there, done that — happy to mentor undergrads.',
    university: 'State University', major: 'Data Science', year: 'PhD',
    teachSkills: ['Machine Learning', 'Statistics', 'Research', 'Python'],
    learnSkills: ['Public Speaking', 'Leadership'],
    availability: 'Open to mentoring', connections: [],
  },
  {
    id: 'seed_leo',
    name: 'Leo Park', email: 'leo@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leo',
    bio: 'Game dev + CS sophomore. Currently building an indie game in Unity.',
    university: 'State University', major: 'Software Engineering', year: '2nd Year',
    teachSkills: ['Game Dev', 'C++', 'JavaScript'],
    learnSkills: ['Mobile Dev', 'UI/UX Design'],
    availability: 'Available for quick help', connections: [],
  },
]

const SEED_POSTS = [
  {
    authorId: 'seed_alex',
    title: 'Need help debugging React useEffect infinite loop',
    description: 'My component keeps re-rendering endlessly. I have a useEffect that fetches data and updates state, but it triggers itself in a loop. Anyone familiar with this?',
    tags: ['CS', 'Design'],
    upvotes: 12, resolved: false,
  },
  {
    authorId: 'seed_priya',
    title: 'Looking for feedback on my portfolio website design',
    description: 'I just finished designing my portfolio in Figma. Would love feedback from anyone with UI/UX experience before I code it up.',
    tags: ['Design', 'Career'],
    upvotes: 8, resolved: false,
  },
  {
    authorId: 'seed_marcus',
    title: 'How do you approach DCF valuation for tech startups?',
    description: 'Working on a case study and traditional DCF feels off for high-growth companies. Any finance folks have advice on adjustments?',
    tags: ['Business'],
    upvotes: 5, resolved: false,
  },
  {
    authorId: 'seed_leo',
    title: 'Best resources to learn machine learning from scratch?',
    description: 'I have solid Python knowledge but zero ML background. What\'s the best structured path — courses, books, or projects?',
    tags: ['CS'],
    upvotes: 19, resolved: true,
  },
]

const SEED_EVENTS = [
  {
    creatorId: 'seed_alex',
    title: 'Weekend Python Study Group',
    description: 'Weekly meetup to work through Python problems together. All levels welcome!',
    type: 'Study Group',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Library Room 204',
    maxParticipants: 10,
    attendees: ['seed_alex', 'seed_leo'],
  },
  {
    creatorId: 'seed_sara',
    title: 'Intro to Machine Learning Workshop',
    description: 'Hands-on workshop covering the fundamentals of supervised learning. Bring your laptop.',
    type: 'Workshop',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Engineering Hall B',
    maxParticipants: 30,
    attendees: ['seed_sara', 'seed_alex', 'seed_leo', 'seed_marcus'],
  },
  {
    creatorId: 'seed_marcus',
    title: 'Spring Hackathon 2025',
    description: '48-hour hackathon open to all majors. Theme: Sustainability Tech. Teams of 2-4.',
    type: 'Hackathon',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Innovation Center',
    maxParticipants: 100,
    attendees: ['seed_marcus', 'seed_alex', 'seed_priya'],
  },
]

const SEED_MENTORSHIP = [
  {
    mentorId: 'seed_sara',
    topic: 'Breaking into Machine Learning research',
    duration: 60,
    availability: 'Saturdays 2-5pm',
    status: 'Open', requestedBy: null,
  },
  {
    mentorId: 'seed_alex',
    topic: 'Getting started with open source contributions',
    duration: 30,
    availability: 'Weekday evenings',
    status: 'Open', requestedBy: null,
  },
  {
    mentorId: 'seed_marcus',
    topic: 'Finance interviews and case prep',
    duration: 60,
    availability: 'Sunday afternoons',
    status: 'Booked', requestedBy: 'seed_leo',
  },
]

const SEED_STORIES = [
  {
    authorId: 'seed_priya',
    content: 'Found my perfect hackathon team through UniConnect! We built an app that won 2nd place at the Spring Hackathon. None of this would\'ve happened without this platform 🎉',
    likes: ['seed_alex', 'seed_marcus'],
  },
  {
    authorId: 'seed_leo',
    content: 'Sara mentored me for just 3 sessions and I went from zero to understanding backpropagation. Got accepted into the university ML research lab this week!',
    likes: ['seed_sara', 'seed_priya', 'seed_alex'],
  },
  {
    authorId: 'seed_alex',
    content: 'Posted a help request about my broken useEffect at midnight. Had 3 responses within an hour. The community here is incredible. Bug squashed!',
    likes: ['seed_leo', 'seed_priya'],
  },
]

export async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Seed users
    for (const user of SEED_USERS) {
      const { id, ...data } = user
      await setDoc(doc(db, 'users', id), { ...data, createdAt: serverTimestamp() })
    }
    console.log('✅ Users seeded')

    // Seed help posts
    for (const post of SEED_POSTS) {
      await addDoc(collection(db, 'helpPosts'), { ...post, createdAt: serverTimestamp() })
    }
    console.log('✅ Help posts seeded')

    // Seed events
    for (const event of SEED_EVENTS) {
      await addDoc(collection(db, 'events'), { ...event, createdAt: serverTimestamp() })
    }
    console.log('✅ Events seeded')

    // Seed mentorship slots
    for (const slot of SEED_MENTORSHIP) {
      await addDoc(collection(db, 'mentorshipSlots'), { ...slot, createdAt: serverTimestamp() })
    }
    console.log('✅ Mentorship slots seeded')

    // Seed success stories
    for (const story of SEED_STORIES) {
      await addDoc(collection(db, 'successStories'), { ...story, createdAt: serverTimestamp() })
    }
    console.log('✅ Success stories seeded')

    console.log('🎉 Database seeded successfully!')
    return true
  } catch (err) {
    console.error('❌ Seed error:', err)
    throw err
  }
}
