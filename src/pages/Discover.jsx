import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, X, GraduationCap, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import ProfileCard from '../components/profile/ProfileCard'
import TutorCard from '../components/discover/TutorCard'
import CourseSearchBar from '../components/discover/CourseSearchBar'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import PageWrapper from '../components/layout/PageWrapper'
import { getAllUsers, getTutors } from '../firebase/firestore'
import { MAJORS, YEARS, SKILL_TAGS, AVAILABILITY_OPTIONS } from '../utils/constants'
import { staggerContainer, staggerItem } from '../lib/motion'
import { cn } from '../lib/utils'

export default function Discover() {
  const [tab, setTab]         = useState('tutors') // 'tutors' | 'browse'
  const [users, setUsers]     = useState([])
  const [tutors, setTutors]   = useState([])
  const [loading, setLoading] = useState(true)

  // Browse students state
  const [search, setSearch]     = useState('')
  const [filters, setFilters]   = useState({ major: '', year: '', skill: '', availability: '' })
  const [showFilters, setShowFilters] = useState(false)

  // Tutor search state
  const [courseQuery, setCourseQuery] = useState('')

  useEffect(() => {
    Promise.all([getAllUsers(), getTutors()]).then(([u, t]) => {
      setUsers(u)
      setTutors(t)
      setLoading(false)
    })
  }, [])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const clearFilters = () => setFilters({ major: '', year: '', skill: '', availability: '' })
  const activeCount = Object.values(filters).filter(Boolean).length

  // Browse students filter
  const filteredUsers = useMemo(() => {
    let r = users
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.teachSkills?.some(s => s.toLowerCase().includes(q)) ||
        u.learnSkills?.some(s => s.toLowerCase().includes(q))
      )
    }
    if (filters.major)        r = r.filter(u => u.major === filters.major)
    if (filters.year)         r = r.filter(u => u.year === filters.year)
    if (filters.skill)        r = r.filter(u => u.teachSkills?.includes(filters.skill) || u.learnSkills?.includes(filters.skill))
    if (filters.availability) r = r.filter(u => u.availability === filters.availability)
    return r
  }, [users, search, filters])

  // Tutor search filter
  const filteredTutors = useMemo(() => {
    if (!courseQuery.trim()) {
      return [...tutors].sort((a, b) =>
        (b.transcriptData?.cumulativeGPA || 0) - (a.transcriptData?.cumulativeGPA || 0)
      )
    }
    const q = courseQuery.toLowerCase()
    return tutors.filter(t => {
      const courses = t.transcriptData?.courses || []
      return courses.some(c =>
        c.gradePoints >= 3.0 &&
        c.earned > 0 &&
        (c.courseCode.toLowerCase().includes(q) || c.courseTitle.toLowerCase().includes(q))
      )
    }).sort((a, b) =>
      (b.transcriptData?.cumulativeGPA || 0) - (a.transcriptData?.cumulativeGPA || 0)
    )
  }, [tutors, courseQuery])

  return (
    <PageWrapper>
      <div className="container py-8 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discover</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} students on campus</p>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('tutors')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border',
              tab === 'tutors'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <GraduationCap size={15} /> Find a Tutor
          </button>
          <button
            onClick={() => setTab('browse')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border',
              tab === 'browse'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Users size={15} /> Browse Students
          </button>
        </div>

        {/* ── FIND A TUTOR ─────────────────────────────────────── */}
        {tab === 'tutors' && (
          <div className="space-y-6">
            <CourseSearchBar value={courseQuery} onChange={setCourseQuery} />

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredTutors.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="text-5xl">🔍</div>
                <h3 className="font-semibold text-foreground text-lg">No tutors found for "{courseQuery}"</h3>
                <p className="text-muted-foreground text-sm">Try a different course name or code.</p>
              </div>
            ) : (
              <>
                {!courseQuery && (
                  <h2 className="font-bold text-foreground text-lg">Top Tutors on Campus 🎓</h2>
                )}
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredTutors.map(t => (
                    <motion.div key={t.id} variants={staggerItem}>
                      <TutorCard profile={t} matchedCourse={courseQuery || undefined} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* ── BROWSE STUDENTS ──────────────────────────────────── */}
        {tab === 'browse' && (
          <div className="space-y-4">
            {/* Search + filter bar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or skill..."
                  className="w-full h-10 bg-card border border-border rounded-full pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button
                variant={showFilters || activeCount ? 'default' : 'outline'}
                size="default"
                onClick={() => setShowFilters(f => !f)}
                className="gap-2"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-primary-foreground/20 text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Select value={filters.major} onChange={e => setFilter('major', e.target.value)}>
                    <option value="">All majors</option>
                    {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                  </Select>
                  <Select value={filters.year} onChange={e => setFilter('year', e.target.value)}>
                    <option value="">All years</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                  <Select value={filters.skill} onChange={e => setFilter('skill', e.target.value)}>
                    <option value="">All skills</option>
                    {SKILL_TAGS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <Select value={filters.availability} onChange={e => setFilter('availability', e.target.value)}>
                    <option value="">Any availability</option>
                    {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <X size={12} /> Clear all filters
                  </button>
                )}
              </motion.div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="text-5xl">🔍</div>
                <h3 className="text-foreground font-semibold text-lg">No students found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
                {activeCount > 0 && <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredUsers.map(u => (
                  <motion.div key={u.id} variants={staggerItem}>
                    <ProfileCard profile={u} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
