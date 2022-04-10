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
