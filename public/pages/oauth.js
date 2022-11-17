const url = new URL(window.location.href)
const state = url.searchParams.get("state")
const code = url.searchParams.get("code")

window.opener.acceptedGoogleLogin = true
window.opener.receiveToken({ state, code })
window.close()
