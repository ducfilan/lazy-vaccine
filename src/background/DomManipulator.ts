let _getConditionalCallback = function (selector: string, callback: Function) {
  return function (this: Element, e: any) {
    if (!e.target) return;
    if (!e.target.matches(selector) && !e.target.closest(selector)) return;
    callback.apply(this, arguments);
  };
}

export function addDynamicEventListener(rootElement: Element, eventType: any, selector: string, callback: Function, options: boolean | AddEventListenerOptions) {
  rootElement.addEventListener(eventType, _getConditionalCallback(selector, callback), options)
}

export function openPage(pageName: string) {
  chrome.tabs.create({
    url: chrome.runtime.getURL(`pages/${pageName}`)
  });
}

export function updatePageTitle(i18nKey: string) {
  document.title = `${chrome.i18n.getMessage('appName')} - ${chrome.i18n.getMessage(i18nKey)}`
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
  let template = document.createElement('template');
  template.innerHTML = htmlString;
  return template.content.childNodes;
}

export function insertBefore(newNode: Node, referenceNode: Node) {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
}
