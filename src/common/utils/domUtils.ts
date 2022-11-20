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

export const detectPageChanged = (
  callback: () => any,
  equalFn: (oldHref: string, newHref: string) => boolean = (o: string, n: string) => o === n,
  allOldIntervalIds: NodeJS.Timer[] = []
) => {
  console.debug("oldIntervalIds: " + allOldIntervalIds)
  allOldIntervalIds.length > 0 && allOldIntervalIds.forEach(id => clearInterval(id))
  let oldHref = document.location.href

  return setInterval(async () => {
    if (!equalFn(oldHref, document.location.href)) {
      console.debug("href changed")
      oldHref = document.location.href
      await callback()
    }
  }, 1000)
}

export const redirectToUrlInNewTab = (url: string) => {
  window?.open(url, "_blank")?.focus()
}

export const isVisible = (elem: HTMLElement): boolean => !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)

export function hrefComparer(this: any, oldHref: string, newHref: string) {
  for (const target of this?.targets || []) {
    const oldId = oldHref.match(target.MatchPattern)?.groups?.id
    const newId = newHref.match(target.MatchPattern)?.groups?.id

    console.debug(`oldHref: ${oldHref}, newHref: ${newHref}, oldId: ${oldId}, newId: ${newId}`)

    if (!oldId && !newId) {
      continue
    }

    return oldId === newId
  }

  return oldHref === newHref
}

export async function writeToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return Promise.resolve()
  }
  return navigator.clipboard.writeText(text)
}

function fallbackCopyTextToClipboard(text: string) {
  var textArea = document.createElement("textarea")
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = "0"
  textArea.style.left = "0"
  textArea.style.position = "fixed"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

export const openPopupCenter = ({ url, title, w, h, onPopupClosed }: { url: string, title: string, w: number, h: number, onPopupClosed: Function }) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop
  const newWindow = window.open(url, title,
    `
    scrollbars=yes,
    width=${w / systemZoom}, 
    height=${h / systemZoom}, 
    top=${top}, 
    left=${left}
    `
  )

  if (newWindow === null) return
  newWindow.focus()
  const timer = setInterval(function () {
    if (newWindow.closed) {
      clearInterval(timer)
      onPopupClosed()
    }
  }, 1000)

}
