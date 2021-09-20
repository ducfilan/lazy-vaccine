export const preventReload = (isPrevent: boolean) => {
  if (isPrevent) {
    window.onbeforeunload = () => true
  } else {
    window.onbeforeunload = null
  }
}

export function deepClone(obj: any, hash = new WeakMap()) {
  if (obj === null) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (typeof obj !== "object") return obj;
  if (hash.get(obj)) return hash.get(obj);
  let cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}

export function removeToNewArray<T>(a: T[], i: number) {
  const newArray = [...a]
  newArray.splice(i, 1)

  return newArray
}