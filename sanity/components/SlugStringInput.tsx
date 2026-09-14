import { useCallback, useState, useEffect } from 'react'
import { set, unset, type StringInputProps } from 'sanity'
import { TextInput } from '@sanity/ui'

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

function SlugStringInput(props: StringInputProps) {
  const { value, onChange } = props

  // Local draft so the user can type freely; we only format on blur.
  const [draft, setDraft] = useState<string>(value ?? '')

  // Keep the draft in sync if the stored value changes elsewhere
  // (e.g. undo/redo, realtime edits from another editor).
  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setDraft(event.currentTarget.value)
    },
    []
  )

  const handleBlur = useCallback(() => {
    const formatted = slugify(draft)
    setDraft(formatted)
    onChange(formatted ? set(formatted) : unset())
  }, [draft, onChange])

  return <TextInput value={draft} onChange={handleChange} onBlur={handleBlur} />
}

export default SlugStringInput
