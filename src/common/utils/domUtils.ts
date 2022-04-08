export const detectPageChanged = (callback: () => any) => {
  var oldHref = document.location.href

  window.onload = function () {
    const bodyList = document.querySelector("body")
    if (bodyList === null) {
      return
    }

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (oldHref != document.location.href) {
          oldHref = document.location.href
          callback()
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
