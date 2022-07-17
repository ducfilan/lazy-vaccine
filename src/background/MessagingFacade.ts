export function sendMessage(type: string, arg: any, resolve: any, reject: any) {
  chrome.runtime.sendMessage({ type, arg }, async function (response) {
    const { success, result, error } = response || {}

    if (!success) {
      reject(error)
    }

    resolve(result)
  })
}
