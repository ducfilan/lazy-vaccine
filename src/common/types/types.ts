export type KeyValuePair = {
  key: string
  value: string
}

export type Language = {
  name: string
  code: string
}

export type GoogleUserInfo = {
  email: string
  email_verified: boolean
  family_name: string
  given_name: string
  locale: string
  name: string
  picture: string
}

export type User = {
  _id: string
  name: string
  email: string
  locale: string
  pictureUrl: string
  finishedRegisterStep: number
  langCodes?: string[]
  pages?: string[]
}

export type Category = {
  title: string
  value: string
  path?: string
  children?: Category[]
}

export class CategoryResponse {
  _id: string
  name: any
  description: any
  path?: string

  constructor(id: string, name: object, description: object, path?: string) {
    this._id = id
    this.name = name
    this.description = description
    this.path = path
  }

  toCategories(langCode: string) {
    return {
      title: this.name[langCode],
      value: this._id,
      path: this.path,
    } as Category
  }
}

export type SetInfo = {
  name: string
  category: string
  description?: string
  tags?: string
  items?: { type: string }[]
  captchaToken?: string | null
}

export type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : { [key: string]: Event };