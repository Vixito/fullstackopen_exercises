import { useState } from 'react'

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = () => setValue('')

  // Devuelve las props para el input y la función reset por separado
  return {
    inputProps: {
      type,
      value,
      onChange
    },
    reset
  }
}