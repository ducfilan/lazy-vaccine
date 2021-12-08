import SupportingLanguages from "@consts/supportingLanguages"
import { KeyValuePair } from "@/common/types/types"
import { DefaultLangCode, LiteralDurationsExtractRegex } from "@consts/constants"

export function formatString(template: string, values: KeyValuePair[]): string {
  for (let i = 0; i < values.length; i++) {
    const pair = values[i]

    template = template.replace(`:${pair.key}`, pair.value)
  }

  return template
}

export const langCodeToName = (code: string | undefined) =>
  SupportingLanguages.Set[code || DefaultLangCode].name

export const formatNumber = (num: number): string => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

/**
 * Return the date after the specified date adding the specified duration.
 * @param duration Duration in literal string format, support d, h, s in that order, e.g. 7d.
 */
export const addDuration = (date: Date, duration: string): Date => {
  const groups = LiteralDurationsExtractRegex.exec(duration)?.groups

  const days: number = parseInt(groups?.days || "0")
  const hours: number = parseInt(groups?.hours || "0")
  const minutes: number = parseInt(groups?.minutes || "0")
  const seconds: number = parseInt(groups?.seconds || "0")

  let result = new Date(date)
  result.setSeconds(result.getSeconds() + days * 86400 + hours * 3600 + minutes * 60 + seconds)

  return result
}

export const getHash = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export const getExtensionFromFileType = (fileType: string): string => {
  switch (fileType) {
    case "image/jpeg":
      return "jpg"

    case "image/png":
      return "png"

    default:
      return "jpg"
  }
}
