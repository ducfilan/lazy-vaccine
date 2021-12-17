export function removeToNewArrayAtIndex<T>(a: T[], i: number) {
  const newArray = [...a]
  newArray.splice(i, 1)

  return newArray
}

export const removeItemToNewArray = <T>(a: T[], item: T) => a.filter(i => i != item)

export const removeDuplicatesFromArray = <T>(a?: T[]) => Array.from(new Set(a || []))
