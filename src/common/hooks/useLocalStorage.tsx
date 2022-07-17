import { useState } from "react"
import { LocalStorageKeyPrefix } from "@consts/constants"
import { addDuration } from "@/common/utils/stringUtils"

/**
 * Local storage hook
 * @param key Cache key to store in localStorage
 * @param expireIn Expire in literal string format, [number]d [number]h [number]m [number]s
 * @returns
 */
function useLocalStorage<T>(key: string, initialValue: T, expireIn: string): any {
  const __prefix__ = LocalStorageKeyPrefix

  const isExpired = (expireAtDateString: string) => new Date() > new Date(expireAtDateString)

  const [storedValue, setStoredValue] = useState<{ value: T; expireAt: Date }>(() => {
    try {
      const cachedObjectJson = window.localStorage.getItem(`${__prefix__}${key}`)
      if (!cachedObjectJson) return null

      const cachedObject = JSON.parse(cachedObjectJson)

      return isExpired(cachedObject.expireAt) ? initialValue : cachedObject
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: { value: T; expireAt: Date }) => { value: T; expireAt: Date })) => {
    try {
      const valueToStore =
        value instanceof Function
          ? value(storedValue)
          : {
              value,
              expireAt: addDuration(new Date(), expireIn),
            }

      setStoredValue(valueToStore)
      window.localStorage.setItem(`${__prefix__}${key}`, JSON.stringify(valueToStore))
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue?.value, setValue] as const
}

export default useLocalStorage
