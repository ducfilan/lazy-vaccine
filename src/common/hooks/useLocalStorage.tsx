import { useState } from "react"

const useLocalStorage = (key: string, initialValue: any = undefined) => {
  const __prefix__ = "duc.lazy-vaccine."

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(`${__prefix__}${key}`)
      return item ? JSON.parse(item) : initialValue
    } catch (err) {
      console.error(err)
      return initialValue
    }
  })

  const setValue = (value: any) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(`${__prefix__}${key}`, JSON.stringify(valueToStore))
    } catch (err) {
      console.error(err)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
