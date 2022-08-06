let observerConfig = {
  childList: true,
}

export const detectPageChangedMutationObserver = (callback: () => any,
  equalFn: (oldHref: string, newHref: string) => boolean = (o: string, n: string) => o === n) => {
  let oldHref = document.location.href

  const bodyList = document.querySelector("body")
  if (bodyList === null) return

  const observer = new MutationObserver(async (mutations) => {
    for (const _mutation of mutations) {
      if (!equalFn(oldHref, document.location.href)) {
        console.debug(`Href changed, oldHref: ${oldHref}, newHref: ${document.location.href}`)

        oldHref = document.location.href
        await callback()

        break
      }
    }
  })

  observer.observe(bodyList, observerConfig)
}

export const detectPageChanged = (callback: () => any,
  equalFn: (oldHref: string, newHref: string) => boolean = (o: string, n: string) => o === n) => {
  let oldHref = document.location.href

  setInterval(async () => {
    if (!equalFn(oldHref, document.location.href)) {
      oldHref = document.location.href
      await callback()
    }
  }, 1000)
}

export const redirectToUrlInNewTab = (url: string) => {
  window?.open(url, "_blank")?.focus()
}
