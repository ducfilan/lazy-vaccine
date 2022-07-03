import { RegexYoutubeHomePage, RegexYoutubeVideoView, RegexFacebookHomePage, SupportingPages, i18n, RegexGoogleHomePage, RegexTwitterHomePage, RegexTwitterPostPage, RegexFacebookWatch, RegexFacebookGaming } from "@/common/consts/constants"

let _getConditionalCallback = function (selector: string, callback: Function) {
  return function (this: Element, e: any) {
    if (!e.target) return
    if (!e.target.matches(selector) && !e.target.closest(selector)) return
    callback.apply(this, arguments)
  }
}

export function addDynamicEventListener(rootElement: Element, eventType: any, selector: string, callback: Function, options?: boolean | AddEventListenerOptions) {
  rootElement.addEventListener(eventType, _getConditionalCallback(selector, callback), options)
}

export function openPage(pageName: string) {
  chrome.tabs.create({
    url: chrome.runtime.getURL(`pages/${pageName}`)
  })
}

export function updatePageTitle(i18nKey: string) {
  document.title = `${i18n('appName')} - ${i18n(i18nKey)}`
}

/**
 * @param {String} htmlString: HTML representing a single element
 * @return {Node}
 */
export function htmlStringToHtmlNode(htmlString: string): Node {
  let template = document.createElement('template')
  template.innerHTML = htmlString.trim()

  const node = template.content.firstChild
  if (!node) {
    throw new Error("invalid htmlString, cannot make html node")
  }

  return node
}

/**
 * @param {String} htmlString: HTML representing any number of sibling elements
 * @return {NodeList}
 */
export function htmlStringToHtmlNodes(htmlString: string): NodeList {
  let template = document.createElement('template')
  template.innerHTML = htmlString
  return template.content.childNodes
}

export function insertBefore(newNode: Node, referenceNode: Node) {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling)
}

export function hrefToSiteName(href: string): string {
  if (RegExp(RegexYoutubeVideoView).test(href)) {
    return SupportingPages.youtube.title
  }

  if (RegExp(RegexYoutubeHomePage).test(href)) {
    return SupportingPages.youtube.title
  }

  if (RegExp(RegexFacebookWatch).test(href)) {
    return SupportingPages.facebook.title
  }

  if (RegExp(RegexFacebookGaming).test(href)) {
    return SupportingPages.facebook.title
  }

  if (RegExp(RegexFacebookHomePage).test(href)) {
    return SupportingPages.facebook.title
  }

  if (RegExp(RegexGoogleHomePage).test(href)) {
    return SupportingPages.google.title
  }

  if (RegExp(RegexTwitterPostPage).test(href)) {
    return SupportingPages.twitter.title
  }

  if (RegExp(RegexTwitterHomePage).test(href)) {
    return SupportingPages.twitter.title
  }

  throw new Error("not supporting site")
}
