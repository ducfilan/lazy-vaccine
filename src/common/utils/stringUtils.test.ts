import { decodeBase64, encodeBase64, getGreetingTime, getMainContent, takeFirstLine } from "./stringUtils"

jest.mock("../consts/constants.ts", () => {
  const originalModule = jest.requireActual('../consts/constants.ts');

  return {
    __esModule: true,
    ...originalModule,
    i18n: jest.fn((message) => {
      switch (message) {
        case "good_morning":
          return "morning"

        case "good_afternoon":
          return "afternoon"

        case "good_evening":
          return "evening"

        default:
          return ""
      }
    })
  }
})

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

  test("encodeBase64 with unicode characters should return base64 encoded string", () => {
    expect(encodeBase64("tình hình thế nào")).toBe("dCUyNUMzJTI1QUNuaCUyNTIwaCUyNUMzJTI1QUNuaCUyNTIwdGglMjVFMSUyNUJBJTI1QkYlMjUyMG4lMjVDMyUyNUEwbw==")
  })

  test("encodeBase64 empty string should return an empty string", () => {
    expect(encodeBase64("")).toBe("")
  })

  test("decodeBase64 should return base64 decoded string", () => {
    expect(decodeBase64("dGVzdA==")).toBe("test")
  })

  test("decodeBase64 with unicode characters should return base64 decoded string", () => {
    expect(decodeBase64("dCUyNUMzJTI1QUNuaCUyNTIwaCUyNUMzJTI1QUNuaCUyNTIwdGglMjVFMSUyNUJBJTI1QkYlMjUyMG4lMjVDMyUyNUEwbw==")).toBe("tình hình thế nào")
  })

  test("decodeBase64 empty string should return an empty string", () => {
    expect(decodeBase64("")).toBe("")
  })

  test("getGreetingTime no input should return current time greeting", () => {
    expect(getGreetingTime()).toBeDefined()
  })

  test("getGreetingTime morning time should return morning greeting", () => {
    expect(getGreetingTime(new Date("2022-12-22 00:00:00"))).toBe("morning")
  })

  test("getGreetingTime afternoon time should return morning greeting", () => {
    expect(getGreetingTime(new Date("2022-12-22 12:00:00"))).toBe("afternoon")
  })

  test("getGreetingTime evening time should return morning greeting", () => {
    expect(getGreetingTime(new Date("2022-12-22 18:00:00"))).toBe("evening")
  })
})
