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
  jwtToken: string
  pictureUrl: string
  finishedRegisterStep: number
}

export type KeyValuePair = {
  key: string
  value: string
}
