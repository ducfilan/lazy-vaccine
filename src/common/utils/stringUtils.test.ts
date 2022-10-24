import { decodeBase64, encodeBase64, getMainContent, takeFirstLine } from "./stringUtils"

describe("Test stringUtils", () => {
  test("takeFirstLine from empty string should return an empty string", () => {
    expect(takeFirstLine("")).toBe("")
  })

  test("takeFirstLine from 2 lines string should return first line", () => {
    expect(takeFirstLine(`line 1
    line 2`)).toBe("line 1")
  })

  test("takeFirstLine with first line is empty should return second line", () => {
    expect(takeFirstLine(`
    line 1
    line 2`)).toBe("line 1")
  })

  test("getMainContent from empty string should return an empty string", () => {
    expect(getMainContent("")).toBe("")
  })

  test("getMainContent with parentheses should return a string without parentheses", () => {
    expect(getMainContent("(test) main content")).toBe("main content")
  })

  test("getMainContent with spaces and newlines at the beginning should return a trimmed string", () => {
    expect(getMainContent(` 
    
    (test) main content   `)).toBe("main content")
  })

  test("encodeBase64 should return base64 encoded string", () => {
    expect(encodeBase64("test")).toBe("dGVzdA==")
  })

  test("decodeBase64 should return base64 decoded string", () => {
    expect(decodeBase64("dGVzdA==")).toBe("test")
  })

  test("encodeBase64 with unicode characters should return base64 encoded string", () => {
    expect(encodeBase64("tình hình thế nào")).toBe("dCUyNUMzJTI1QUNuaCUyNTIwaCUyNUMzJTI1QUNuaCUyNTIwdGglMjVFMSUyNUJBJTI1QkYlMjUyMG4lMjVDMyUyNUEwbw==")
  })

  test("decodeBase64 with unicode characters should return base64 decoded string", () => {
    expect(decodeBase64("dCUyNUMzJTI1QUNuaCUyNTIwaCUyNUMzJTI1QUNuaCUyNTIwdGglMjVFMSUyNUJBJTI1QkYlMjUyMG4lMjVDMyUyNUEwbw==")).toBe("tình hình thế nào")
  })

  test("encodeBase64 empty string should return an empty string", () => {
    expect(encodeBase64("")).toBe("")
  })

  test("decodeBase64 empty string should return an empty string", () => {
    expect(decodeBase64("")).toBe("")
  })
})
