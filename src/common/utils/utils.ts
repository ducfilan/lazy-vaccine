import { track } from "@amplitude/analytics-browser"
import { ItemsInteractionShow } from "../consts/constants"
import { TrackingNameInteractItem, TrackingNameShowItem } from "../consts/trackingNames"

export const preventReload = (isPrevent: boolean) => {
  if (isPrevent) {
    window.onbeforeunload = () => true
  } else {
    window.onbeforeunload = null
  }
}

export function deepClone(obj: any, hash = new WeakMap()) {
  if (obj === null) return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)
  if (typeof obj !== "object") return obj
  if (hash.get(obj)) return hash.get(obj)
  let cloneObj = new obj.constructor()
  hash.set(obj, cloneObj)
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash)
    }
  }
  return cloneObj
}

/**
 * True at percent / total of the times.
 * @param percent percentage of appearance (0-1)
 * @returns true / false randomly based on percentage.
 */
export function appearInPercent(percent: number): boolean {
  return Math.random() < percent
}

export function getStorageSyncData<T>(key: string): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (obj) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }

      resolve(obj[key] as T)
    })
  })
}

export function getStorageLocalData<T>(key: string): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (obj) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }

      resolve(obj[key] as T)
    })
  })
}

export function setStorageSyncData(key: string, value: any): Promise<void> {
  return chrome.storage.sync.set({ [key]: value })
}

export function setStorageLocalData(key: string, value: any): Promise<void> {
  return chrome.storage.local.set({ [key]: value })
}

export function trackUserBehavior(name: string, metadata?: { [key: string]: any } | null) {
  track(name, metadata || {})
}

export function trackUserItemInteraction(interaction: string, itemId: string) {
  trackUserBehavior(interaction === ItemsInteractionShow ? TrackingNameShowItem : TrackingNameInteractItem, { interaction, itemId })
}
