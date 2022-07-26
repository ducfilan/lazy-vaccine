import {
  FlashCardOptions,
  i18n,
  InjectTypes,
  InjectWrapperClassName,
  ItemTypes,
  OtherItemTypes,
  SettingKeyBackItem,
  SettingKeyFrontItem,
} from "@/common/consts/constants"
import { KeyValuePair, PageInjectorSiblingSelectorParts } from "@/common/types/types"
import { formatString, trimQuotes } from "@/common/utils/stringUtils"
import { MutationObserverFacade } from "@facades/mutationObserverFacade"
import { renderToString } from "react-dom/server"
import { FlashCardTemplate } from "./templates/FlashcardTemplate"
import { htmlStringToHtmlNode, insertBefore } from "./DomManipulator"
import React from "react"
import { QnATemplate } from "./templates/QandATemplate"
import { sendGetLocalSettingMessage } from "@/pages/content-script/messageSenders"
import { ContentTemplate } from "./templates/ContentTemplate"
import { SuggestSubscribeTemplate } from "./templates/SuggestSubscribeTemplate"
import { SuggestLoginTemplate } from "./templates/SuggestLoginTemplate"

export async function getTemplate(type: string) {
  console.debug("getTemplate called, type: " + type)

  switch (type) {
    case ItemTypes.TermDef.value:
      const frontItemSettingKey = (await sendGetLocalSettingMessage(SettingKeyFrontItem)) || ""
      const backItemSettingKey = (await sendGetLocalSettingMessage(SettingKeyBackItem)) || ""

      let settingFrontItem = FlashCardOptions[frontItemSettingKey.toString()] || i18n("select")
      let settingBackItem = FlashCardOptions[backItemSettingKey.toString()] || i18n("select")

      return renderToString(
        <FlashCardTemplate selectedFrontItem={settingFrontItem} selectedBackItem={settingBackItem} />
      )

    case ItemTypes.QnA.value:
      return renderToString(<QnATemplate />)

    case ItemTypes.Content.value:
      return renderToString(<ContentTemplate />)

    case OtherItemTypes.NotLoggedIn.value:
      return renderToString(<SuggestLoginTemplate />)

    case OtherItemTypes.NotSubscribed.value:
      return renderToString(<SuggestSubscribeTemplate />)

    default:
      return ""
  }
}

export default class PageInjector {
  private rate: number
  private type: number
  private parentSelector: string
  private newGeneratedElementSelectorParts: PageInjectorSiblingSelectorParts
  private siblingSelectorParts: PageInjectorSiblingSelectorParts
  private newGeneratedElementSelector: string
  private siblingSelector: string
  private strict: boolean
  private waitTimeOutInMs: number
  private waitCount = 0

  private dynamicNewNodesCount = 0
  private dynamicInjectedCount = 0

  private allObservers: MutationObserverFacade[] = []

  /**
   *
   * @param rate
   * @param type constants.InjectTypes
   * @param parentSelector
   * @param siblingSelector
   */
  constructor(
    rate: number,
    type: number,
    parentSelector: string,
    newGeneratedElementSelector?: string,
    siblingSelector?: string,
    strict?: boolean,
    waitTimeOutInMs: number = 30000
  ) {
    this.rate = rate
    this.type = type
    this.parentSelector = parentSelector
    this.siblingSelector = siblingSelector || ""
    this.siblingSelectorParts = siblingSelector
      ? this.parseSelector(siblingSelector)
      : ({
          tag: "",
          classes: [],
          id: "",
          attrs: [],
        } as PageInjectorSiblingSelectorParts)

    this.newGeneratedElementSelector = newGeneratedElementSelector || ""
    this.newGeneratedElementSelectorParts = newGeneratedElementSelector
      ? this.parseSelector(newGeneratedElementSelector)
      : this.siblingSelectorParts

    this.strict = strict || false
    this.waitTimeOutInMs = waitTimeOutInMs
  }

  private parseSelector(selectorString: string) {
    const { tag, selector } = selectorString.match(/^(?<tag>\w*)(?<selector>.*?)$/)?.groups as {
      tag: string
      selector: string
    }

    let selectorParts: PageInjectorSiblingSelectorParts = {
      tag: tag.toUpperCase(),
      classes: [],
      id: "",
      attrs: [],
    }

    selector.split(/(?=\.)|(?=#)|(?=\[)/).forEach(function (token: string) {
      switch (token[0]) {
        case "#":
          selectorParts.id = token.slice(1)
          break
        case ".":
          selectorParts.classes.push(token.slice(1))
          break
        case "[":
          selectorParts.attrs.push([
            ...token
              .slice(1, -1)
              .split("=")
              .map((part) => trimQuotes(part)),
          ])
          break
        default:
          break
      }
    })

    return selectorParts
  }

  private isSiblingSelectorPartsEmpty(): boolean {
    return (
      this.siblingSelectorParts?.attrs.length == 0 &&
      this.siblingSelectorParts.tag == "" &&
      this.siblingSelectorParts.classes.length == 0 &&
      this.siblingSelectorParts.id === ""
    )
  }

  private processAddedNodes(
    _this: {
      templateValueGetter: () => Promise<KeyValuePair[]>
    },
    nodes: Element[]
  ) {
    nodes = [...nodes].filter((node: Element) => {
      if (
        (this.newGeneratedElementSelectorParts.classes.length > 0 && (!node.classList || node.classList.length == 0)) ||
        (this.strict &&
          this.newGeneratedElementSelectorParts.classes.length == 0 &&
          node.classList &&
          node.classList.length > 0) ||
        (this.newGeneratedElementSelectorParts.attrs.length > 0 && (!node.attributes || node.attributes.length == 0)) ||
        (this.strict &&
          this.newGeneratedElementSelectorParts.attrs.length > 0 &&
          node.attributes &&
          node.attributes.length > 0) ||
        (this.newGeneratedElementSelectorParts.id != "" && (!node.id || node.id == "")) ||
        (this.strict && this.newGeneratedElementSelectorParts.id == "" && node.id && node.id != "") ||
        (this.newGeneratedElementSelectorParts.tag != "" && (!node.tagName || node.tagName == ""))
      ) {
        return false
      }

      const classList = Array.prototype.slice.call(node.classList)
      const attrs: NamedNodeMap = node.attributes

      const isTagNameMatch =
        this.newGeneratedElementSelectorParts.tag === "" || this.newGeneratedElementSelectorParts.tag == node.tagName
      const isIdsMatch =
        this.newGeneratedElementSelectorParts.id === "" || this.newGeneratedElementSelectorParts.id == node.id
      const isClassesMatch =
        this.newGeneratedElementSelectorParts.classes.length === 0 ||
        this.newGeneratedElementSelectorParts.classes.every((c) => classList.includes(c))
      const isAttrsMatch =
        this.newGeneratedElementSelectorParts.attrs.length == 0 ||
        this.newGeneratedElementSelectorParts.attrs.every(
          ([attrKey, attrVal]) => attrs.getNamedItem(attrKey)?.value === attrVal
        )

      return isClassesMatch && isAttrsMatch && isIdsMatch && isTagNameMatch
    })

    nodes.length > 0 &&
      nodes.forEach(async (node) => {
        if (this.dynamicNewNodesCount++ * this.rate < this.dynamicInjectedCount) return
        this.dynamicInjectedCount++

        const templateValue = await _this.templateValueGetter()
        if (!templateValue || templateValue.length === 0) return

        const typeItem = templateValue.find((item) => item.key === "type")?.value
        getTemplate(typeItem || "").then((htmlTemplate) => {
          const htmlString = formatString(htmlTemplate, templateValue)

          const insertToChildren = this.newGeneratedElementSelector != "" && this.siblingSelector != ""
          if (insertToChildren) {
            const siblingNode = node.querySelector(this.siblingSelector)
            const similarNode = node.querySelector(InjectWrapperClassName)
            !similarNode && siblingNode && insertBefore(htmlStringToHtmlNode(htmlString), siblingNode)
          } else {
            insertBefore(htmlStringToHtmlNode(htmlString), node)
          }
        })
      })
  }

  private inject(templateValueGetter: () => Promise<KeyValuePair[]>) {
    try {
      console.debug("inject called, this.type: " + this.type)

      if (this.type == InjectTypes.FixedPosition) {
        this.injectFixedPosition(templateValueGetter)
      } else if (this.type == InjectTypes.DynamicGenerated) {
        const increaseOnCall = true
        this.injectDynamicPosition(templateValueGetter.bind(null, increaseOnCall))
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

    const typeItem = templateValue.find((item) => item.key === "type")?.value
    getTemplate(typeItem || "").then((htmlTemplate) => {
      const htmlString = formatString(htmlTemplate, templateValue)

      const node = htmlStringToHtmlNode(htmlString)
      if (!node) {
        throw new Error("invalid htmlTemplate")
      }

      document.querySelector(this.parentSelector)?.prepend(node)
    })
  }

  private injectDynamicPosition(templateValueGetter: () => Promise<KeyValuePair[]>) {
    if (!this.siblingSelectorParts || this.isSiblingSelectorPartsEmpty()) {
      throw new Error("siblingSelectorParts is required when injecting dynamic generated content")
    }

    const observer = new MutationObserverFacade(
      this.parentSelector,
      null,
      this.processAddedNodes.bind(this, { templateValueGetter })
    )

    this.allObservers.push(observer)

    observer.observe()
  }

  getAllObservers(): MutationObserverFacade[] {
    return this.allObservers
  }

  /**
   * Wait until the target node to be rendered then inject.
   */
  async waitInject(
    templateValueGetter: () => Promise<KeyValuePair[]>,
    intervalInMs: number = 500,
    cleanupFn: () => void = () => {
      // Do nothing by default.
    }
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const id = setInterval(() => {
        const isSelectorRendered = document.querySelector(this.parentSelector)

        if (isSelectorRendered) {
          clearInterval(id)
          resolve()

          this.inject(templateValueGetter)
          cleanupFn()
        }

        if (intervalInMs * ++this.waitCount > this.waitTimeOutInMs) {
          clearInterval(id)
          resolve()
        }
      }, intervalInMs)
    })
  }
}
