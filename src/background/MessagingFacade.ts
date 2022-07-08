export function sendMessage(type: string, arg: any, resolve: Function, reject: Function) {
  chrome.runtime.sendMessage({ type, arg }, async function ({ success, result, error }) {
    if (!success) {
      reject(error)
    }

    resolve(result)
  })
}
