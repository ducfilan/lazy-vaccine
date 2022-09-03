export class MutationObserverFacade {
  private observer: MutationObserver
  private targetNode: Node | null
  private config: MutationObserverInit

  private DefaultConfig = {
    childList: true,
    subtree: true
  }

  constructor(selector: string, config: MutationObserverInit | null, callback: Function) {
    this.targetNode = document.querySelector(selector)
    this.config = config || this.DefaultConfig

    this.observer = new MutationObserver(this._callbackForAddedNodes(callback))
  }

  private _callbackForAddedNodes(callback: Function) {
    return function (mutations: MutationRecord[], observer: MutationObserver) {
      for (const mutation of mutations) {
        if (mutation.type == "childList") {
          callback(mutation.addedNodes)
        }
      }
    }
  }

  observe() {
    if (!this.targetNode) {
      throw new Error("wrong target node to observe")
    }

    this.observer.observe(this.targetNode, this.config)
  }

  stop() {
    this.observer.disconnect()
  }
}
