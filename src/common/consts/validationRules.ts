export const RequiredRule = { required: true, message: chrome.i18n.getMessage("required_field") }

export const MaxLengthRule = (length: number) => (() => ({
  validator(_: any, value: any) {
    if (!value || value.length <= length) {
      return Promise.resolve()
    }

    return Promise.reject(new Error(`${chrome.i18n.getMessage("max_length_field")} ${length}`))
  },
}))