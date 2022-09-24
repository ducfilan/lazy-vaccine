export function removeToNewArrayAtIndex<T>(a: T[], i: number) {
  const newArray = [...a]
  newArray.splice(i, 1)

  return newArray
}

export const removeItemToNewArray = <T>(a: T[], item: T) => a.filter(i => i != item)

export const removeDuplicatesFromArray = <T>(a?: T[]) => Array.from(new Set(a || []))

export const shuffleArray = (a: any[]) => {
  let currentIndex = a.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    [a[currentIndex], a[randomIndex]] = [
      a[randomIndex], a[currentIndex]]
  }

  return a
}

export const generateNumbersArray = (size: number, start: number = 0): number[] => Array.from(Array(size).keys()).map(num => num + start)

export const isArraysEqual = (a1: any[], a2: any[]): boolean => {
  if (!a2)
    return false

  if (a1.length != a2.length)
    return false

  a1 = a1.sort()
  a2 = a2.sort()

  for (let i = 0, l = a1.length; i < l; i++) {
    if (a1[i] instanceof Array && a2[i] instanceof Array) {
      if (!a1[i].equals(a2[i]))
        return false
    }
    else if (a1[i] != a2[i]) {
      return false
    }
  }
  return true
}

export const pickRandomFlatColor = () => {
  const colorsCode = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", "#e74c3c", "#7f8c8d"]
  return colorsCode[Math.floor(Math.random() * colorsCode.length)]
}
