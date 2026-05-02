import { useState } from 'react'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { Separator } from '../ui/Separator'
import { createEvent } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { EVENT_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function CreateEventForm({ onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', type: '', date: '', location: '', maxParticipants: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.type || !form.date) { toast.error('Title, type and date are required'); return }
    setLoading(true)
    try {
      await createEvent({ ...form, creatorId: user.uid, maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null })
      toast.success('Event created!')
      onClose()
    } catch { toast.error('Failed to create event') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Event Title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Python Study Group" required />
      <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="What's this event about?" />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)} required>
          <option value="">Select type</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Max Participants" type="number" min="2" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} placeholder="Unlimited" />
      </div>
      <Input label="Date & Time" type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required />
      <Input label="Location" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room 204 / Online / Zoom link" />
      <Separator />
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Create Event</Button>
      </div>
    </form>
  )
}
