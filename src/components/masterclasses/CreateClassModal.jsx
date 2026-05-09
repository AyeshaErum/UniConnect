import { useState } from 'react'
import { Input, Textarea, Select, Label } from '../ui/Input'
import { Button } from '../ui/Button'
import { Separator } from '../ui/Separator'
import { createMasterclass } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const TOPICS = ['Programming', 'Cybersecurity', 'Math', 'Data Science', 'Design', 'Career', 'Other']
const DURATIONS = ['30 mins', '60 mins', '90 mins', '2 hours']

function validateMeetLink(url) {
  try {
    const u = new URL(url)
    return u.hostname === 'meet.google.com' || u.hostname.endsWith('.meet.google.com')
  } catch {
    return false
  }
}

export default function CreateClassModal({ onClose }) {
  const { user, profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    topic: '',
    googleMeetLink: '',
    scheduledAt: '',
    duration: '60 mins',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.title.trim())         { toast.error('Title is required'); return }
    if (!form.topic)                 { toast.error('Topic is required'); return }
    if (!form.scheduledAt)           { toast.error('Date & time is required'); return }
    if (!form.googleMeetLink.trim()) { toast.error('Google Meet link is required'); return }
    if (!validateMeetLink(form.googleMeetLink.trim())) {
      toast.error('Enter a valid Google Meet link (meet.google.com/...)')
      return
    }

    setSaving(true)
    try {
      await createMasterclass({
        title:          form.title.trim(),
        description:    form.description.trim(),
        topic:          form.topic,
        googleMeetLink: form.googleMeetLink.trim(),
        scheduledAt:    new Date(form.scheduledAt),
        duration:       form.duration,
        instructor:     profile?.name || 'Anonymous',
        createdBy:      user.uid,
      })
      toast.success('Masterclass created!')
      onClose()
    } catch (err) {
      toast.error('Failed to create: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Class Title"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="e.g. Python for Beginners"
      />

      <Textarea
        label="Description"
        value={form.description}
        onChange={e => set('description', e.target.value)}
        rows={3}
        placeholder="What will students learn?"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Topic" value={form.topic} onChange={e => set('topic', e.target.value)}>
          <option value="">Select topic</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Duration" value={form.duration} onChange={e => set('duration', e.target.value)}>
          {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>

      <Input
        label="Google Meet Link"
        value={form.googleMeetLink}
        onChange={e => set('googleMeetLink', e.target.value)}
        placeholder="https://meet.google.com/xxx-xxxx-xxx"
        type="url"
      />

      <div className="space-y-1.5">
        <Label>Date & Time</Label>
        <input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={e => set('scheduledAt', e.target.value)}
          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} type="button">Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSubmit} type="button">Create Class</Button>
      </div>
    </div>
  )
}
