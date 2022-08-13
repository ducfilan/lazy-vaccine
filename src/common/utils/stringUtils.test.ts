window.chrome = {
  i18n: {
    getMessage: () => ""
  }
} as any

import { getMainContent, takeFirstLine } from "./stringUtils"

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
