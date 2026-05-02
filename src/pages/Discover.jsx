import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProfileCard from '../components/profile/ProfileCard'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { getAllUsers } from '../firebase/firestore'
import { MAJORS, YEARS, SKILL_TAGS, AVAILABILITY_OPTIONS } from '../utils/constants'
import { Select } from '../components/ui/Input'

export default function Discover() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filters, setFilters] = useState({ major: '', year: '', skill: '', availability: '' })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false) })
  }, [])

  function setFilter(k, v) { setFilters(f => ({ ...f, [k]: v })) }
  function clearFilters()   { setFilters({ major: '', year: '', skill: '', availability: '' }) }

  const filtered = useMemo(() => {
    let result = users
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.teachSkills?.some(s => s.toLowerCase().includes(q)) ||
        u.learnSkills?.some(s => s.toLowerCase().includes(q))
      )
    }
    if (filters.major)        result = result.filter(u => u.major === filters.major)
    if (filters.year)         result = result.filter(u => u.year === filters.year)
    if (filters.skill)        result = result.filter(u =>
      u.teachSkills?.includes(filters.skill) || u.learnSkills?.includes(filters.skill)
    )
    if (filters.availability) result = result.filter(u => u.availability === filters.availability)
    return result
  }, [users, search, filters])

  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Discover Students</h1>
          <p className="text-navy-400 text-sm mt-1">{users.length} students on campus</p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or skill..."
            className="w-full bg-navy-800 border border-navy-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            showFilters || activeFilters
              ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
              : 'bg-navy-800 text-navy-300 border-navy-700 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilters > 0 && (
            <span className="w-4 h-4 bg-teal-500 text-navy-950 rounded-full text-[10px] flex items-center justify-center font-bold">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 animate-fade-in">
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
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="mt-3 text-sm text-navy-400 hover:text-white flex items-center gap-1">
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-white font-semibold text-lg">No students found</h3>
          <p className="text-navy-400 text-sm mt-1">Try adjusting your search or filters</p>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="mt-3 text-teal-400 text-sm hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(u => <ProfileCard key={u.id} profile={u} />)}
        </div>
      )}
    </div>
  )
}
