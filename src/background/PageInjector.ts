import { PageInjectorSiblingSelectorParts } from "@/common/types/types"
import { MutationObserverFacade } from "@facades/mutationObserverFacade"
import { InjectTypes } from "./constants"
import { htmlStringToHtmlNode, insertBefore } from "./DomManipulator"


export default class PageInjector {
  private rate: number
  private type: number
  private parentSelector: string
  private siblingSelectorParts: PageInjectorSiblingSelectorParts | null

  /**
   * 
   * @param rate 
   * @param type constants.InjectTypes
   * @param parentSelector 
   * @param siblingSelector 
   */
  constructor(rate: number, type: number, parentSelector: string, siblingSelector?: string) {
    this.rate = rate
    this.type = type
    this.parentSelector = parentSelector
    this.siblingSelectorParts = siblingSelector ? this.parseSelector(siblingSelector) : null
  }

  private parseSelector(selectorString: string) {
    let selectorParts: PageInjectorSiblingSelectorParts = {
      tags: [],
      classes: [],
      ids: [],
      attrs: []
    };

    selectorString.split(/(?=\.)|(?=#)|(?=\[)/).forEach(function (token: string) {
      switch (token[0]) {
        case '#':
          selectorParts.ids.push(token.slice(1));
          break;
        case '.':
          selectorParts.classes.push(token.slice(1));
          break;
        case '[':
          selectorParts.attrs.push(...token.slice(1, -1).split('='));
          break;
        default:
          selectorParts.tags.push(token);
          break;
      }
    });

    return selectorParts;
  }

  private processAddedNodes(this: { htmlContent: string, siblingSelectorParts: PageInjectorSiblingSelectorParts }, nodes: Node[]) {
    nodes = Array.prototype.slice.call(nodes).filter(
      node => {
        if (node.classList == undefined || node.classList.length == 0) {
          return false;
        }

        let classList = Array.prototype.slice.call(node.classList)
        // TODO: Add filtering by ID.
        return this.siblingSelectorParts.classes.every(c => classList.includes(c))
      }
    );

    // TODO: Add rate processing logic.
    nodes.forEach(node => insertBefore(htmlStringToHtmlNode(this.htmlContent), node))
  }

  inject(htmlContent: string) {
    if (this.type == InjectTypes.FixedPosition) {
      if (!this.parentSelector) {
        throw new Error("parentSelector is not set")
      }

      const node = htmlStringToHtmlNode(htmlContent)
      if (!node) {
        throw new Error("invalid htmlContent")
      }

      document.querySelector(this.parentSelector)?.prepend(node);
    } else if (this.type == InjectTypes.DynamicGenerated) {
      if (!this.siblingSelectorParts) {
        throw new Error("siblingSelectorParts is required when injecting dynamic generated content")
      }

      const observer = new MutationObserverFacade(
        this.parentSelector,
        null,
        this.processAddedNodes.bind({ siblingSelectorParts: this.siblingSelectorParts, htmlContent })
      )

      observer.observe();
    } else {
      throw new Error("invalid inject type");
    }
  }
}
