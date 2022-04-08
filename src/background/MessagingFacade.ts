export function sendMessage(type: string, arg: any, resolve: Function, reject: Function) {
  chrome.runtime.sendMessage({ type, arg }, async function ({ success, result, error }) {
    if (!success) {
      reject(`cannot get response, type: ${type}, error: ${JSON.stringify(error)}`)
    }

    resolve(result)
  })
}
