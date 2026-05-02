import { useState } from 'react'
import Input, { Textarea, Select } from '../ui/Input'
import Button from '../ui/Button'
import { createMentorshipSlot } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function SlotForm({ onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ topic: '', duration: '30', availability: '' })
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.topic || !form.availability) {
      toast.error('Topic and availability are required')
      return
    }
    setLoading(true)
    try {
      await createMentorshipSlot({ ...form, mentorId: user.uid, duration: parseInt(form.duration) })
      toast.success('Mentorship slot created!')
      onClose()
    } catch {
      toast.error('Failed to create slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Topic" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. Breaking into ML research" required />
      <Select label="Duration" value={form.duration} onChange={e => set('duration', e.target.value)}>
        <option value="30">30 minutes</option>
        <option value="60">60 minutes</option>
      </Select>
      <Input label="Availability" value={form.availability} onChange={e => set('availability', e.target.value)} placeholder="e.g. Saturdays 2-5pm, weekday evenings" required />
      <div className="flex gap-3 pt-2 border-t border-navy-700">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Create Slot</Button>
      </div>
    </form>
  )
}
