let observerConfig = {
  childList: true,
  subtree: true
}

export const detectPageChanged = (callback: () => any,
  initialCall?: boolean,
  equalFn: (oldHref: string, newHref: string) => boolean = (o: string, n: string) => o === n) => {
  let oldHref: string

  window.onload = async function () {
    if (initialCall) {
      await callback()
    }

    const bodyList = document.querySelector("body")
    if (bodyList === null) return

    const observer = new MutationObserver(async (mutations) => {
      if (!oldHref) {
        oldHref = document.location.href
        return
      }

      for (const _mutation of mutations) {
        if (!equalFn(oldHref, document.location.href)) {
          console.log(`Debug: Href changed, oldHref: ${oldHref}, newHref: ${document.location.href}`)

          oldHref = document.location.href
          await callback()
        }

        break
      }
    })

    observer.observe(bodyList, observerConfig)
  }
}

export const redirectToUrlInNewTab = (url: string) => {
  window?.open(url, "_blank")?.focus()
}
