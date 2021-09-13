export const preventReload = (isPrevent: boolean) => {
  if (isPrevent) {
    window.onbeforeunload = () => true
  } else {
    window.onbeforeunload = null
  }
}