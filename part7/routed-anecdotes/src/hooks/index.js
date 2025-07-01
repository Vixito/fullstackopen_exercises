import { useState } from 'react'

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = () => setValue('')

  // No incluyo reset en el spread para evitar warnings en el input
  return {
    type,
    value,
    onChange,
    reset
  }
}