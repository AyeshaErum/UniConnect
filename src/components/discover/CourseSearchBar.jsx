import { Search, X } from 'lucide-react'

export default function CourseSearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by course name or code (e.g. INFS 1101, Python, Networking...)"
        className="w-full h-12 bg-card border border-border rounded-2xl pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
