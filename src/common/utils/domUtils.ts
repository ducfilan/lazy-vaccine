let observerConfig = {
  childList: true,
  subtree: true
}

export const detectPageChanged = (callback: () => any,
  initialCall?: boolean,
  equalFn: (oldHref: string, newHref: string) => boolean = (o: string, n: string) => o === n) => {
  let oldHref = document.location.href

  window.onload = async function () {
    initialCall && (await callback())

    const bodyList = document.querySelector("body")
    if (bodyList === null) {
      return
    }

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(async function (_mutation) {
        if (!equalFn(oldHref, document.location.href)) {
          oldHref = document.location.href
          await callback()
        }
      })
    })

    observer.observe(bodyList, observerConfig)
  }
}

export const redirectToUrlInNewTab = (url: string) => {
  window?.open(url, "_blank")?.focus()
}
