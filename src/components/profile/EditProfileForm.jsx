import { useState } from 'react'
import { Camera, Plus } from 'lucide-react'
import { Input, Textarea, Select, Label } from '../ui/Input'
import { Button } from '../ui/Button'
import SkillTag from './SkillTag'
import Avatar from '../ui/Avatar'
import { MAJORS, YEARS, AVAILABILITY_OPTIONS, SKILL_TAGS } from '../../utils/constants'
import { updateUserProfile } from '../../firebase/firestore'
import { uploadProfilePhoto } from '../../firebase/storage'
import { useAuth } from '../../context/AuthContext'
import { trackProfileCompleted } from '../../utils/analytics'
import { Separator } from '../ui/Separator'
import toast from 'react-hot-toast'

export default function EditProfileForm({ onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || '', bio: profile?.bio || '',
    university: profile?.university || '', major: profile?.major || '',
    year: profile?.year || '', availability: profile?.availability || '',
    teachSkills: profile?.teachSkills || [], learnSkills: profile?.learnSkills || [],
  })
  const [skillInput, setSkillInput] = useState({ teach: '', learn: '' })
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [preview, setPreview]       = useState(profile?.photoURL || '')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setUploading(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      setPreview(url)
      await updateUserProfile(user.uid, { photoURL: url })
      await refreshProfile()
      toast.success('Photo updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  function addSkill(type) {
    const val = skillInput[type].trim()
    if (!val) return
    const key = type === 'teach' ? 'teachSkills' : 'learnSkills'
    if (!form[key].includes(val)) set(key, [...form[key], val])
    setSkillInput(s => ({ ...s, [type]: '' }))
  }

  function removeSkill(type, label) {
    const key = type === 'teach' ? 'teachSkills' : 'learnSkills'
    set(key, form[key].filter(s => s !== label))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await updateUserProfile(user.uid, form)
      await refreshProfile()
      if (form.major && form.year) trackProfileCompleted(form.major, form.year)
      toast.success('Profile saved!')
      onClose()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar src={preview} name={form.name} size="xl" />
          <label className="absolute -bottom-1 -right-1 cursor-pointer bg-primary hover:bg-primary/90 rounded-full p-1.5 transition-colors shadow-md">
            {uploading
              ? <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              : <Camera size={13} className="text-primary-foreground" />
            }
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG or GIF · max 5MB</p>
      </div>

      <Separator />

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

      <Separator />

      {/* Teach skills */}
      <div className="space-y-2">
        <Label>Skills I Can Teach</Label>
        <div className="flex gap-2">
          <input
            list="teach-list" value={skillInput.teach}
            onChange={e => setSkillInput(s => ({ ...s, teach: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('teach'))}
            placeholder="Add a skill..."
            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <datalist id="teach-list">{SKILL_TAGS.map(s => <option key={s} value={s} />)}</datalist>
          <Button size="icon" variant="outline" onClick={() => addSkill('teach')} type="button"><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5">{form.teachSkills.map(s => <SkillTag key={s} label={s} variant="teach" onRemove={() => removeSkill('teach', s)} />)}</div>
      </div>

      {/* Learn skills */}
      <div className="space-y-2">
        <Label>Skills I Want to Learn</Label>
        <div className="flex gap-2">
          <input
            list="learn-list" value={skillInput.learn}
            onChange={e => setSkillInput(s => ({ ...s, learn: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('learn'))}
            placeholder="Add a skill..."
            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <datalist id="learn-list">{SKILL_TAGS.map(s => <option key={s} value={s} />)}</datalist>
          <Button size="icon" variant="outline" onClick={() => addSkill('learn')} type="button"><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5">{form.learnSkills.map(s => <SkillTag key={s} label={s} variant="learn" onRemove={() => removeSkill('learn', s)} />)}</div>
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} type="button">Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleSave} type="button">Save Changes</Button>
      </div>
    </div>
  )
}
