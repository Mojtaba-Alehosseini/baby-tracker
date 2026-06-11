import { useState, useRef } from 'react'
import { Plus, Trash2, Download, Upload, ChevronRight, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { ActivityType, Companion } from '../db/types'
import { useActivityTypes } from '../hooks/useActivityTypes'
import { useCompanions } from '../hooks/useCompanions'
import { useUIStore } from '../store/uiStore'
import { downloadCSV } from '../utils/csvExport'
import { importFromCSV } from '../utils/csvImport'
import { BottomSheet } from '../components/BottomSheet'

// ─── Activity type editor sheet ────────────────────────────────────────────────

interface ActivityEditorProps {
  type?: ActivityType
  onSave: (data: Omit<ActivityType, 'id' | 'createdAt' | 'isDefault'>) => Promise<void>
  onClose: () => void
}

const PRESET_COLORS = [
  { color: '#FF6B6B', colorLight: '#FFE5E5' },
  { color: '#4ECDC4', colorLight: '#E0F7F6' },
  { color: '#A78BFA', colorLight: '#EDE9FE' },
  { color: '#FFB347', colorLight: '#FFF0D0' },
  { color: '#6BCB77', colorLight: '#E5F7E8' },
  { color: '#60A5FA', colorLight: '#DBEAFE' },
  { color: '#F472B6', colorLight: '#FCE7F3' },
  { color: '#94A3B8', colorLight: '#F1F5F9' },
]

function ActivityEditor({ type, onSave, onClose }: ActivityEditorProps) {
  const [name, setName] = useState(type?.name ?? '')
  const [emoji, setEmoji] = useState(type?.emoji ?? '🎯')
  const [colorIdx, setColorIdx] = useState(
    type ? PRESET_COLORS.findIndex((c) => c.color === type.color) || 0 : 0
  )
  const [allowCompanions, setAllowCompanions] = useState(type?.allowCompanions ?? false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const preset = PRESET_COLORS[colorIdx]
    await onSave({
      name: name.trim(),
      emoji,
      color: preset.color,
      colorLight: preset.colorLight,
      allowCompanions,
      sortOrder: type?.sortOrder ?? 99,
    })
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Activity name"
          className="glass w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-coral/40"
          maxLength={30}
          autoFocus
        />
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Emoji
        </label>
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="glass w-full rounded-2xl px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-coral/40"
          maxLength={2}
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map(({ color }, i) => (
            <button
              key={color}
              onClick={() => setColorIdx(i)}
              className="pressable w-9 h-9 rounded-full transition-transform"
              style={{ backgroundColor: color }}
              aria-label={`Color ${i + 1}`}
            >
              {colorIdx === i && <Check size={14} className="text-white mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Allow companions */}
      <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Track companions</p>
          <p className="text-xs text-slate-400">Who joined this activity</p>
        </div>
        <button
          role="switch"
          aria-checked={allowCompanions}
          onClick={() => setAllowCompanions((v) => !v)}
          className={`pressable relative w-12 h-6 rounded-full transition-colors duration-200 ${
            allowCompanions ? 'bg-coral' : 'bg-slate-200'
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              allowCompanions ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="pressable w-full py-3.5 rounded-2xl bg-coral text-white font-semibold text-sm disabled:opacity-40"
      >
        {saving ? 'Saving…' : type ? 'Save Changes' : 'Add Activity'}
      </button>
    </div>
  )
}

// ─── Companion editor sheet ────────────────────────────────────────────────────

interface CompanionEditorProps {
  companion?: Companion
  onSave: (data: Omit<Companion, 'id' | 'createdAt'>) => Promise<void>
  onClose: () => void
}

function CompanionEditor({ companion, onSave, onClose }: CompanionEditorProps) {
  const [name, setName] = useState(companion?.name ?? '')
  const [emoji, setEmoji] = useState(companion?.emoji ?? '👤')
  const [relationship, setRelationship] = useState(companion?.relationship ?? '')

  async function handleSave() {
    if (!name.trim()) return
    await onSave({ name: name.trim(), emoji, relationship: relationship.trim() })
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="glass w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-coral/40"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Avatar Emoji
        </label>
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="glass w-full rounded-2xl px-4 py-3 text-2xl outline-none focus:ring-2 focus:ring-coral/40"
          maxLength={2}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Relationship
        </label>
        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="e.g. Grandmother, Father"
          className="glass w-full rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-coral/40"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="pressable w-full py-3.5 rounded-2xl bg-coral text-white font-semibold text-sm disabled:opacity-40"
      >
        {companion ? 'Save Changes' : 'Add Person'}
      </button>
    </div>
  )
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────

export function SettingsPage() {
  const { activityTypes, addActivityType, updateActivityType, deleteActivityType } =
    useActivityTypes()
  const { companions, addCompanion, updateCompanion, deleteCompanion } = useCompanions()
  const { addToast } = useUIStore()
  const importRef = useRef<HTMLInputElement>(null)

  const [editingActivity, setEditingActivity] = useState<ActivityType | 'new' | null>(null)
  const [editingCompanion, setEditingCompanion] = useState<Companion | 'new' | null>(null)
  const [importing, setImporting] = useState(false)

  // ── CSV export / import ──────────────────────────────────────────────────

  async function handleExport() {
    try {
      await downloadCSV()
      addToast('CSV exported successfully')
    } catch {
      addToast('Export failed', 'error')
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const result = await importFromCSV(file)
      addToast(
        `Imported ${result.imported} entries${result.skipped ? `, skipped ${result.skipped}` : ''}`,
        'success'
      )
    } catch (err) {
      addToast('Import failed — check CSV format', 'error')
    } finally {
      setImporting(false)
      if (importRef.current) importRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      </div>

      {/* Activities section */}
      <section className="px-5" aria-label="Activity types">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">Activities</h2>
          <button
            onClick={() => setEditingActivity('new')}
            className="pressable flex items-center gap-1 px-3 py-1.5 rounded-full glass text-sm font-medium text-coral"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {(activityTypes ?? []).map((a) => (
            <div key={a.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: a.colorLight }}
              >
                {a.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                {a.allowCompanions && (
                  <p className="text-xs text-slate-400">Tracks companions</p>
                )}
              </div>
              <button
                onClick={() => setEditingActivity(a)}
                className="pressable w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
                aria-label={`Edit ${a.name}`}
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => deleteActivityType(a.id)}
                className="pressable w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-400"
                aria-label={`Delete ${a.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Companions section */}
      <section className="px-5" aria-label="Companions">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">Companions</h2>
          <button
            onClick={() => setEditingCompanion('new')}
            className="pressable flex items-center gap-1 px-3 py-1.5 rounded-full glass text-sm font-medium text-coral"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
        </div>
        {(companions ?? []).length === 0 ? (
          <div className="glass rounded-2xl px-4 py-5 text-center">
            <p className="text-sm text-slate-400">
              Add people who join Armin's activities
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(companions ?? []).map((c) => (
              <div key={c.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                  {c.relationship && (
                    <p className="text-xs text-slate-400">{c.relationship}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditingCompanion(c)}
                  className="pressable w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
                  aria-label={`Edit ${c.name}`}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => deleteCompanion(c.id)}
                  className="pressable w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-400"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Data section */}
      <section className="px-5" aria-label="Data management">
        <h2 className="text-base font-semibold text-slate-700 mb-3">Data</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExport}
            className="pressable glass rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-teal/15 flex items-center justify-center">
              <Download size={16} className="text-teal" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Export CSV</p>
              <p className="text-xs text-slate-400">Download all entries</p>
            </div>
          </button>

          <label className="pressable glass rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-lavender/15 flex items-center justify-center">
              <Upload size={16} className="text-lavender" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Import CSV</p>
              <p className="text-xs text-slate-400">
                {importing ? 'Importing…' : 'Merge from a backup file'}
              </p>
            </div>
            <input
              ref={importRef}
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={handleImportFile}
              disabled={importing}
            />
          </label>
        </div>
      </section>

      {/* App info */}
      <section className="px-5">
        <div className="glass rounded-2xl px-4 py-4 text-center">
          <p className="text-2xl mb-1">🌟</p>
          <p className="text-sm font-semibold text-slate-700">Armin Tracker</p>
          <p className="text-xs text-slate-400 mt-0.5">
            All data stored locally on this device
          </p>
        </div>
      </section>

      {/* Activity editor sheet */}
      <BottomSheet
        isOpen={editingActivity !== null}
        onClose={() => setEditingActivity(null)}
        title={editingActivity === 'new' ? 'Add Activity' : 'Edit Activity'}
      >
        {editingActivity !== null && (
          <ActivityEditor
            type={editingActivity === 'new' ? undefined : editingActivity}
            onSave={
              editingActivity === 'new'
                ? addActivityType
                : (data) => updateActivityType((editingActivity as ActivityType).id, data)
            }
            onClose={() => setEditingActivity(null)}
          />
        )}
      </BottomSheet>

      {/* Companion editor sheet */}
      <BottomSheet
        isOpen={editingCompanion !== null}
        onClose={() => setEditingCompanion(null)}
        title={editingCompanion === 'new' ? 'Add Person' : 'Edit Person'}
      >
        {editingCompanion !== null && (
          <CompanionEditor
            companion={editingCompanion === 'new' ? undefined : editingCompanion}
            onSave={
              editingCompanion === 'new'
                ? addCompanion
                : (data) => updateCompanion((editingCompanion as Companion).id, data)
            }
            onClose={() => setEditingCompanion(null)}
          />
        )}
      </BottomSheet>
    </div>
  )
}
