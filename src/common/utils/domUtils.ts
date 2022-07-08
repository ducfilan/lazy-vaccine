export const detectPageChanged = (callback: () => any, initialCall?: boolean) => {
  var oldHref = document.location.href

  window.onload = async function () {
    initialCall && (await callback())

    const bodyList = document.querySelector("body")
    if (bodyList === null) {
      return
    }

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(async function (_mutation) {
        if (oldHref != document.location.href) {
          oldHref = document.location.href
          await callback()
        }
      })
    })

    var config = {
      childList: true,
      subtree: true
    }

    observer.observe(bodyList, config)
  }
}

export const redirectToUrl = (url: string) => {
  window?.open(url, "_blank")?.focus()
}
