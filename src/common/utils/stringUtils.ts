import SupportingLanguages from "@consts/supportingLanguages";
import { KeyValuePair } from "@/common/types/types";
import { DefaultLangCode, LiteralDurationsExtractRegex } from "@consts/constants";

export function formatString(template: string, values: KeyValuePair[]): string {
  for (let i = 0; i < values.length; i++) {
    const pair = values[i];

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
