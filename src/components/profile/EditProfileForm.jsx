import { useState } from 'react'
import { Camera, Plus } from 'lucide-react'
import Input, { Textarea, Select } from '../ui/Input'
import Button from '../ui/Button'
import SkillTag from './SkillTag'
import Avatar from '../ui/Avatar'
import { MAJORS, YEARS, AVAILABILITY_OPTIONS, SKILL_TAGS } from '../../utils/constants'
import { updateUserProfile } from '../../firebase/firestore'
import { uploadProfilePhoto } from '../../firebase/storage'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function EditProfileForm({ onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name:         profile?.name || '',
    bio:          profile?.bio || '',
    university:   profile?.university || '',
    major:        profile?.major || '',
    year:         profile?.year || '',
    availability: profile?.availability || '',
    teachSkills:  profile?.teachSkills || [],
    learnSkills:  profile?.learnSkills || [],
  })
  const [skillInput, setSkillInput]   = useState({ teach: '', learn: '' })
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [photoPreview, setPhotoPreview] = useState(profile?.photoURL || '')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setUploading(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      setPhotoPreview(url)
      await updateUserProfile(user.uid, { photoURL: url })
      await refreshProfile()
      toast.success('Photo updated!')
    } catch {
      toast.error('Photo upload failed')
    } finally {
      setUploading(false)
    }
  }

  function addSkill(type) {
    const val = skillInput[type].trim()
    if (!val) return
    const key = type === 'teach' ? 'teachSkills' : 'learnSkills'
    if (!form[key].includes(val)) {
      set(key, [...form[key], val])
    }
    setSkillInput(s => ({ ...s, [type]: '' }))
  }

  function removeSkill(type, label) {
    const key = type === 'teach' ? 'teachSkills' : 'learnSkills'
    set(key, form[key].filter(s => s !== label))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      await updateUserProfile(user.uid, form)
      await refreshProfile()
      toast.success('Profile saved!')
      onClose()
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={photoPreview} name={form.name} size="xl" />
          <label className="absolute bottom-0 right-0 cursor-pointer bg-teal-500 hover:bg-teal-400 rounded-full p-1.5 transition-colors">
            {uploading
              ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              : <Camera size={14} className="text-navy-950" />
            }
            <input
              type="file" accept="image/*" className="hidden"
              onChange={handlePhotoChange} disabled={uploading}
            />
          </label>
        </div>
        <p className="text-xs text-navy-400">Upload a photo (max 5MB)</p>
      </div>

      <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
      <Textarea label="Bio" value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Tell people about yourself..." />
      <Input label="University" value={form.university} onChange={e => set('university', e.target.value)} placeholder="State University" />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Major" value={form.major} onChange={e => set('major', e.target.value)}>
          <option value="">Select major</option>
          {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
        </Select>
        <Select label="Year" value={form.year} onChange={e => set('year', e.target.value)}>
          <option value="">Select year</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>

      <Select label="Availability" value={form.availability} onChange={e => set('availability', e.target.value)}>
        <option value="">Select status</option>
        {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
      </Select>

      {/* Teach skills */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-navy-200">Skills I Can Teach</label>
        <div className="flex gap-2">
          <input
            list="teach-suggestions"
            className="flex-1 bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            value={skillInput.teach}
            onChange={e => setSkillInput(s => ({ ...s, teach: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSkill('teach')}
            placeholder="Add a skill..."
          />
          <datalist id="teach-suggestions">
            {SKILL_TAGS.map(s => <option key={s} value={s} />)}
          </datalist>
          <Button size="sm" onClick={() => addSkill('teach')}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.teachSkills.map(s => (
            <SkillTag key={s} label={s} variant="teach" onRemove={() => removeSkill('teach', s)} />
          ))}
        </div>
      </div>

      {/* Learn skills */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-navy-200">Skills I Want to Learn</label>
        <div className="flex gap-2">
          <input
            list="learn-suggestions"
            className="flex-1 bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            value={skillInput.learn}
            onChange={e => setSkillInput(s => ({ ...s, learn: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSkill('learn')}
            placeholder="Add a skill..."
          />
          <datalist id="learn-suggestions">
            {SKILL_TAGS.map(s => <option key={s} value={s} />)}
          </datalist>
          <Button size="sm" onClick={() => addSkill('learn')}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.learnSkills.map(s => (
            <SkillTag key={s} label={s} variant="learn" onRemove={() => removeSkill('learn', s)} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-navy-700">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
