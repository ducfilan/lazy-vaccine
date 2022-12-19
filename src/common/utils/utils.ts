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
  window.heap.track(name, metadata || {})
}

export function trackUserItemInteraction(interaction: string, itemId: string) {
  trackUserBehavior(interaction === ItemsInteractionShow ? TrackingNameShowItem : TrackingNameInteractItem, { interaction, itemId })
}

const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
export function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  let base64 = ''

  const bytes = new Uint8Array(arrayBuffer)
  const byteLength = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength = byteLength - byteRemainder

  let a, b, c, d
  let chunk

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63 // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] // + '=='
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] // + '='
  }

  return base64
}

function charCodeToNumber(charCode: number): number {
  if (charCode >= 65 && charCode <= 90) {
    return charCode - 65
  } else if (charCode >= 97 && charCode <= 122) {
    return charCode - 71
  } else if (charCode >= 48 && charCode <= 57) {
    return charCode + 4
  } else if (charCode === 45) {
    return 62
  } else if (charCode === 95) {
    return 63
  } else {
    throw new Error('Invalid char code in url safe base64: ' + charCode)
  }
}

export function base64ToArrayBuffer(str: string): ArrayBuffer {
  const mod4 = str.length % 4
  let mainByteLength = 0
  let mainStringLength = 0
  let restByteLength = 0
  if (mod4 === 0) {
    mainByteLength = str.length / 4 * 3
    mainStringLength = str.length
  } else if (mod4 === 1) {
    throw new Error('invalid url safe base64 encoded string: ' + str)
  } else if (mod4 === 2) {
    mainByteLength = (str.length - 2) / 4 * 3
    mainStringLength = str.length - 2
    restByteLength = 1
  } else {
    mainByteLength = (str.length - 3) / 4 * 3
    mainStringLength = str.length - 3
    restByteLength = 2
  }

  // 3-byte chunk
  let chunk
  const resultBuffer = new Uint8Array(mainByteLength + restByteLength)

  // process main string
  let a, b, c, d
  for (let i = 0, j = 0; i < mainStringLength; i += 4, j += 3) {
    a = charCodeToNumber(str.charCodeAt(i))
    b = charCodeToNumber(str.charCodeAt(i + 1))
    c = charCodeToNumber(str.charCodeAt(i + 2))
    d = charCodeToNumber(str.charCodeAt(i + 3))
    chunk = (a << 18) + (b << 12) + (c << 6) + d
    resultBuffer.set(
      [
        (chunk & 0xFF0000) >> 16,
        (chunk & 0x00FF00) >> 8,
        chunk & 0x0000FF
      ],
      j
    )
  }

  // process rest string
  if (mod4 === 2) {
    // 1 byte remain
    a = charCodeToNumber(str.charCodeAt(mainStringLength))
    b = charCodeToNumber(str.charCodeAt(mainStringLength + 1))
    chunk = (a << 2) + (b >> 4)
    resultBuffer.set(
      [
        chunk & 0xFF
      ],
      mainByteLength
    )
  } else if (mod4 === 3) {
    // 2 bytes remain
    a = charCodeToNumber(str.charCodeAt(mainStringLength))
    b = charCodeToNumber(str.charCodeAt(mainStringLength + 1))
    c = charCodeToNumber(str.charCodeAt(mainStringLength + 2))
    chunk = (a << 10) + (b << 4) + (c >> 2)
    resultBuffer.set(
      [
        (chunk & 0xFF00) >> 8,
        chunk & 0x00FF
      ],
      mainByteLength
    )
  }

  return resultBuffer
}
