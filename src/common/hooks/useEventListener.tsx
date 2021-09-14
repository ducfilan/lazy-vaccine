import { useCallback, useEffect, useRef } from "react"
import { EventMap } from "@/common/types/types"

function managedEventListener<T extends EventTarget, K extends keyof EventMap<T> & string>(
  target: T,
  type: K,
  callback: (event: EventMap<T>[K]) => void,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(type, callback as EventListener, options)
  return (): void => {
    target.removeEventListener(type, callback as EventListener, options)
  }
}

function useEventCallback<T extends Function>(callback: T): (...args: unknown[]) => T {
  // Source: https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = callback
  }, [callback])

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return useCallback((...args): T => ref.current!(...args), [ref])
}

/**
 * Listens to an event while the enclosing component is mounted.
 *
 * @see [Event reference on MDN](https://developer.mozilla.org/en-US/docs/Web/Events), [This hook source](https://github.com/kripod/react-hooks)
 *
 * @param {EventTarget} target Target to listen on, possibly a DOM element or a remote service connector.
 * @param {string} type Name of event (case-sensitive).
 * @param {EventListener} callback Method to execute whenever the event fires.
 * @param options Additional listener characteristics.
 *
 * @example
 * function Component() {
 *   useEventListener(window, 'error', () => {
 *     console.log('A resource failed to load.');
 *   });
 *   // ...
 * }
 */
export default function useEventListener<T extends EventTarget, K extends keyof EventMap<T> & string>(
  target: T,
  type: K,
  callback: (event: EventMap<T>[K]) => void,
  options?: AddEventListenerOptions
): void {
  // Based on the implementation of `useInterval`
  const savedCallback = useEventCallback(callback)

  useEffect(() => managedEventListener(target, type, savedCallback, options), [options, savedCallback, target, type])
}
