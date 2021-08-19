enum StatusCode {
  Ok = 200,
  Unauthorized = 401,
  Forbidden = 403,
  TooManyRequests = 429,
  InternalServerError = 500,
}

export default StatusCode;