import { InjectTypes, ItemTypes } from "@/common/consts/constants"
import { KeyValuePair, PageInjectorSiblingSelectorParts, SetInfoItem } from "@/common/types/types"
import { formatString, trimQuotes } from "@/common/utils/stringUtils"
import { MutationObserverFacade } from "@facades/mutationObserverFacade"
import { renderToString } from "react-dom/server"
import { FlashCardTemplate } from "./templates/Flashcard"
import { htmlStringToHtmlNode, insertBefore } from "./DomManipulator"
import React from "react"
import { QnATemplate } from "./templates/QandA"

export function getTemplate(type: string) {
  switch (type) {
    case 'term&def':
      return renderToString(<FlashCardTemplate />)
    case 'q&a':
      return renderToString(<QnATemplate />)
    default:
      return renderToString(<FlashCardTemplate />)
  }
}

export default class PageInjector {
  private rate: number
  private type: number
  private parentSelector: string
  private siblingSelectorParts: PageInjectorSiblingSelectorParts | null

  private waitTimeOutInMs: number
  private waitCount = 0

  /**
   * 
   * @param rate 
   * @param type constants.InjectTypes
   * @param parentSelector 
   * @param siblingSelector 
   */
  constructor(rate: number, type: number, parentSelector: string, siblingSelector?: string, waitTimeOutInMs: number = 15000) {
    this.rate = rate
    this.type = type
    this.parentSelector = parentSelector
    this.siblingSelectorParts = siblingSelector ? this.parseSelector(siblingSelector) : null
    this.waitTimeOutInMs = waitTimeOutInMs
  }

  private parseSelector(selectorString: string) {
    let selectorParts: PageInjectorSiblingSelectorParts = {
      tags: [],
      classes: [],
      id: "",
      attrs: []
    }

    selectorString.split(/(?=\.)|(?=#)|(?=\[)/).forEach(function (token: string) {
      switch (token[0]) {
        case '#':
          selectorParts.id = token.slice(1)
          break
        case '.':
          selectorParts.classes.push(token.slice(1))
          break
        case '[':
          selectorParts.attrs.push([...token.slice(1, -1).split('=').map(part => trimQuotes(part))])
          break
        default:
          selectorParts.tags.push(token)
          break
      }
    })

    return selectorParts
  }

  private isSiblingSelectorPartsEmpty(): boolean {
    return this.siblingSelectorParts?.attrs.length == 0 &&
      this.siblingSelectorParts.tags.length == 0 &&
      this.siblingSelectorParts.classes.length == 0 &&
      this.siblingSelectorParts.id === ""
  }

  private processAddedNodes(this: {
    siblingSelectorParts: PageInjectorSiblingSelectorParts,
    templateValueGetter: () => Promise<KeyValuePair[]>,
  }, nodes: Element[]) {
    nodes = Array.prototype.slice.call(nodes).filter(
      (node: Element) => {
        if ((!node.classList || node.classList.length == 0) && !node.id && (!node.attributes || node.attributes.length == 0)) {
          return false
        }

        const classList = Array.prototype.slice.call(node.classList)
        const attrs: NamedNodeMap = node.attributes

        const isIdsMatch = this.siblingSelectorParts.id === "" || this.siblingSelectorParts.id == node.id
        const isClassesMatch = this.siblingSelectorParts.classes.length === 0 || this.siblingSelectorParts.classes.every(c => classList.includes(c))
        const isAttrsMatch = this.siblingSelectorParts.attrs.length == 0 || this.siblingSelectorParts.attrs.every(([attrKey, attrVal]) => attrs.getNamedItem(attrKey)?.value === attrVal)

        return isIdsMatch && isClassesMatch && isAttrsMatch
      }
    )

    // TODO: Add rate processing logic.
    nodes.length > 0 && nodes.forEach(async node => {
      const templateValue = await this.templateValueGetter()
      if (!templateValue || templateValue.length === 0) return

      const typeItem = templateValue.find(item => item.key === 'type')?.value
      const htmlTemplate = getTemplate(typeItem || "")
      const htmlString = formatString(htmlTemplate, templateValue)

      insertBefore(htmlStringToHtmlNode(htmlString), node)
    })
  }

  private inject(templateValueGetter: () => Promise<KeyValuePair[]>) {
    try {
      if (this.type == InjectTypes.FixedPosition) {
        this.injectFixedPosition(templateValueGetter)
      } else if (this.type == InjectTypes.DynamicGenerated) {
        this.injectDynamicPosition(templateValueGetter)
      } else {
        throw new Error("invalid inject type")
      }
    } catch (error) {
      console.log("Lazy Vaccine: Unexpected error when injecting.")
    }
  }

  private async injectFixedPosition(templateValueGetter: () => Promise<KeyValuePair[]>) {
    if (!this.parentSelector) {
      throw new Error("parentSelector is not set")
    }

    const templateValue = await templateValueGetter()
    if (!templateValue || templateValue.length === 0) return

    const typeItem = templateValue.find(item => item.key === 'type')?.value
    const htmlTemplate = getTemplate(typeItem || "")
    const htmlString = formatString(htmlTemplate, templateValue)

    const node = htmlStringToHtmlNode(htmlString)
    if (!node) {
      throw new Error("invalid htmlTemplate")
    }

    document.querySelector(this.parentSelector)?.prepend(node)
  }

  private injectDynamicPosition(templateValueGetter: () => Promise<KeyValuePair[]>) {
    if (!this.siblingSelectorParts || this.isSiblingSelectorPartsEmpty()) {
      throw new Error("siblingSelectorParts is required when injecting dynamic generated content")
    }

    const observer = new MutationObserverFacade(
      this.parentSelector,
      null,
      this.processAddedNodes.bind({ siblingSelectorParts: this.siblingSelectorParts, templateValueGetter })
    )

    observer.observe()
  }

  /**
   * Wait until the target node to be rendered then inject.
   */
  waitInject(templateValueGetter: () => Promise<KeyValuePair[]>, intervalInMs: number = 500) {
    const id = setInterval(() => {
      const isSelectorRendered = document.querySelector(this.parentSelector)

      if (isSelectorRendered) {
        this.inject(templateValueGetter)

        clearInterval(id)
      }

      if (intervalInMs * ++this.waitCount > this.waitTimeOutInMs) {
        clearInterval(id)
      }
    }, intervalInMs)
  }
}
