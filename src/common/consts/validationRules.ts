import { i18n } from "./constants"

export const RequiredRule = { required: true, message: i18n("required_field") }

export const MaxLengthRule = (length: number) => (() => ({
  validator(_: any, value: any) {
    if (!value || value.length <= length) {
      return Promise.resolve()
    }

    return Promise.reject(new Error(`${i18n("max_length_field")} ${length}`))
  },
}))