import SupportingLanguages from "@consts/supportingLanguages";
import { KeyValuePair } from "@/common/types/types";

export function formatString(template: string, values: KeyValuePair[]): string {
  for (let i = 0; i < values.length; i++) {
    const pair = values[i];

    template = template.replace(`{${pair.key}}`, pair.value)
  }

  return template
}

export const langCodeToName = (code: string | undefined) =>
  SupportingLanguages.Set[code || "en"].name || SupportingLanguages.Set["en"].name
