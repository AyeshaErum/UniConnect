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
    university: 'UDST', major: 'Computer Science', year: '3rd Year',
    teachSkills: ['Python', 'Machine Learning', 'React'],
    learnSkills: ['Cybersecurity', 'Cloud'],
    availability: 'Open to mentoring', connections: [],
    isTutor: true,
    transcriptData: {
      cumulativeGPA: 3.92,
      totalCredits: 75,
      lastUpdated: new Date().toISOString(),
      courses: [
        { courseCode: 'INFS 1101', courseTitle: 'Intro to Computing & Problem Solving', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'INFS 1201', courseTitle: 'Programming Fundamentals', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'DACS 2101', courseTitle: 'Data Structures & Algorithms', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'INFT 2101', courseTitle: 'Computer Networks', grade: 'A-', gradePoints: 3.7, earned: 3 },
        { courseCode: 'MATH 1101', courseTitle: 'Calculus I', grade: 'B+', gradePoints: 3.5, earned: 3 },
        { courseCode: 'MATH 2101', courseTitle: 'Linear Algebra', grade: 'B+', gradePoints: 3.5, earned: 3 },
        { courseCode: 'DACS 3101', courseTitle: 'Machine Learning Fundamentals', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'INFS 2201', courseTitle: 'Database Systems', grade: 'A-', gradePoints: 3.7, earned: 3 },
        { courseCode: 'INFT 3101', courseTitle: 'Web Application Development', grade: 'A', gradePoints: 4.0, earned: 3 },
      ],
    },
  },
  {
    id: 'seed_priya',
    name: 'Priya Sharma', email: 'priya@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    bio: 'Design student who loves turning ideas into beautiful products.',
    university: 'UDST', major: 'Design', year: '2nd Year',
    teachSkills: ['UI/UX Design', 'Figma', 'Photography'],
    learnSkills: ['React', 'Web Development'],
    availability: 'Free this evening', connections: [],
  },
  {
    id: 'seed_marcus',
    name: 'Marcus Johnson', email: 'marcus@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    bio: 'Finance major & hackathon enthusiast. Can help with Excel & financial modeling.',
    university: 'UDST', major: 'Finance', year: '4th Year',
    teachSkills: ['Finance', 'Excel', 'Project Management'],
    learnSkills: ['Python', 'Data Analysis'],
    availability: 'Available weekends', connections: [],
  },
  {
    id: 'seed_sara',
    name: 'Sara El-Amin', email: 'sara@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
    bio: 'PhD candidate in ML. Been there, done that — happy to mentor undergrads.',
    university: 'UDST', major: 'Data Science', year: 'PhD',
    teachSkills: ['Machine Learning', 'Statistics', 'Research', 'Python'],
    learnSkills: ['Public Speaking', 'Leadership'],
    availability: 'Open to mentoring', connections: [],
    isTutor: true,
    transcriptData: {
      cumulativeGPA: 3.98,
      totalCredits: 108,
      lastUpdated: new Date().toISOString(),
      courses: [
        { courseCode: 'DACS 2101', courseTitle: 'Data Structures & Algorithms', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'DACS 3101', courseTitle: 'Machine Learning Fundamentals', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'DACS 4101', courseTitle: 'Deep Learning', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'MATH 2101', courseTitle: 'Linear Algebra', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'MATH 3101', courseTitle: 'Probability & Statistics', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'INFS 2201', courseTitle: 'Database Systems', grade: 'A-', gradePoints: 3.7, earned: 3 },
        { courseCode: 'INFS 1101', courseTitle: 'Intro to Computing & Problem Solving', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'DACS 3201', courseTitle: 'Data Visualization', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'DACS 4201', courseTitle: 'Natural Language Processing', grade: 'A-', gradePoints: 3.7, earned: 3 },
        { courseCode: 'INFT 2201', courseTitle: 'Cybersecurity Fundamentals', grade: 'B+', gradePoints: 3.5, earned: 3 },
      ],
    },
  },
  {
    id: 'seed_leo',
    name: 'Leo Park', email: 'leo@university.edu',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leo',
    bio: 'Game dev + CS sophomore. Currently building an indie game in Unity.',
    university: 'UDST', major: 'Software Engineering', year: '2nd Year',
    teachSkills: ['Game Dev', 'C++', 'JavaScript'],
    learnSkills: ['Mobile Dev', 'UI/UX Design'],
    availability: 'Available for quick help', connections: [],
    isTutor: true,
    transcriptData: {
      cumulativeGPA: 3.55,
      totalCredits: 42,
      lastUpdated: new Date().toISOString(),
      courses: [
        { courseCode: 'INFS 1101', courseTitle: 'Intro to Computing & Problem Solving', grade: 'A', gradePoints: 4.0, earned: 3 },
        { courseCode: 'INFS 1201', courseTitle: 'Programming Fundamentals', grade: 'B+', gradePoints: 3.5, earned: 3 },
        { courseCode: 'MATH 1101', courseTitle: 'Calculus I', grade: 'B', gradePoints: 3.0, earned: 3 },
        { courseCode: 'DACS 2101', courseTitle: 'Data Structures & Algorithms', grade: 'B+', gradePoints: 3.5, earned: 3 },
        { courseCode: 'INFT 2101', courseTitle: 'Computer Networks', grade: 'B', gradePoints: 3.0, earned: 3 },
      ],
    },
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

const SEED_MASTERCLASSES = [
  {
    title: 'Python for Beginners: From Zero to Scripting',
    instructor: 'Alex Chen',
    description: 'Start from scratch and write your first Python script in 60 minutes. Covers variables, loops, functions, and file I/O.',
    googleMeetLink: 'https://meet.google.com/abc-defg-hij',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    duration: '60 mins',
    topic: 'Programming',
    createdBy: 'seed_alex',
  },
  {
    title: 'Intro to Cybersecurity: Threats & Defenses',
    instructor: 'Sara El-Amin',
    description: 'Walk through common attack vectors — phishing, SQL injection, and social engineering — and learn how to defend against them.',
    googleMeetLink: 'https://meet.google.com/xyz-mnop-qrs',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    duration: '90 mins',
    topic: 'Cybersecurity',
    createdBy: 'seed_sara',
  },
  {
    title: 'Linear Algebra for Machine Learning',
    instructor: 'Sara El-Amin',
    description: 'Matrices, eigenvectors, and why they matter for ML. Practical examples in NumPy.',
    googleMeetLink: 'https://meet.google.com/lma-trix-ml1',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: '60 mins',
    topic: 'Math',
    createdBy: 'seed_sara',
  },
  {
    title: 'Build Your First React App',
    instructor: 'Leo Park',
    description: 'Build a todo app step by step — components, state, props, and basic hooks. No prior React experience needed.',
    googleMeetLink: 'https://meet.google.com/rct-app-001',
    scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    duration: '60 mins',
    topic: 'Programming',
    createdBy: 'seed_leo',
  },
  {
    title: 'Cracking CS Internship Interviews',
    instructor: 'Alex Chen',
    description: 'Mock technical interview session covering LeetCode patterns, behavioral questions, and how to structure your answers.',
    googleMeetLink: 'https://meet.google.com/crk-int-rvw',
    scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    duration: '90 mins',
    topic: 'Career',
    createdBy: 'seed_alex',
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

    // Seed masterclasses
    for (const cls of SEED_MASTERCLASSES) {
      await addDoc(collection(db, 'masterclasses'), {
        ...cls,
        scheduledAt: Timestamp.fromDate(cls.scheduledAt),
        createdAt:   serverTimestamp(),
      })
    }
    console.log('✅ Masterclasses seeded')

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
