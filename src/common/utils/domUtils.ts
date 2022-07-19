let observerConfig = {
  childList: true,
  subtree: true
}

export const detectPageChanged = (callback: () => any,
  initialCall?: boolean,
  equalFn: (oldHref: string, newHref: string) => boolean = (o: string, n: string) => o === n) => {
  let oldHref = document.location.href

  window.onload = async function () {
    if (initialCall) {
      await callback()
      return
    }

    const bodyList = document.querySelector("body")
    if (bodyList === null) {
      return
    }

    const observer = new MutationObserver(async (mutations) => {
      for (const _mutation of mutations) {
        if (!equalFn(oldHref, document.location.href)) {
          console.log(`Debug: Href changed, oldHref: ${oldHref}, newHref: ${document.location.href}`)

          oldHref = document.location.href
          await callback()

          observer.disconnect()
          break
        }
      }
    })

    observer.observe(bodyList, observerConfig)
  }
}

export const redirectToUrlInNewTab = (url: string) => {
  window?.open(url, "_blank")?.focus()
}
