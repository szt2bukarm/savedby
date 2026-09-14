import { useCallback } from 'react'
import { set, unset, type StringInputProps } from 'sanity'
import { TextArea } from '@sanity/ui'

function TextAreaInput(props: StringInputProps) {
  const { value, onChange, schemaType } = props
  const rows = (schemaType.options as { rows?: number })?.rows ?? 2

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLTextAreaElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return <TextArea rows={rows} value={value ?? ''} onChange={handleChange} />
}

export default TextAreaInput
