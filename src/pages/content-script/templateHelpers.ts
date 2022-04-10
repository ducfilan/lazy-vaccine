import { hrefToSiteName } from "@/background/DomManipulator"
import { SetInfoItem, KeyValuePair } from "@/common/types/types"
import { getHref } from "./domHelpers"

export const toTemplateValues = (item: SetInfoItem | null | undefined, otherKeyValueItems: { [key: string]: string } = {}) => {
  if (!item) return []

  const itemKeyValue = Object.entries(item).map(([key, value]) => ({ key, value } as KeyValuePair))
  let otherKeyValue = Object.entries(otherKeyValueItems).map(([key, value]) => ({ key, value } as KeyValuePair))
  otherKeyValue = [...otherKeyValue, { key: "website", value: hrefToSiteName(getHref()) }]

  return [...itemKeyValue, ...otherKeyValue]
}
