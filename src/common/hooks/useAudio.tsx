import { useMemo, useEffect, useState } from "react"

const useAudio = (url: string | undefined): [() => void, () => void, boolean, () => void] => {
  const audio = useMemo(() => new Audio(url), [url])
  const [playing, setPlaying] = useState(false)

  const toggle = () => setPlaying(!playing)
  const play = () => audio.play()
  const pause = () => audio.pause()

  useEffect(() => {
    playing ? audio.play() : audio.pause()
  }, [playing])

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false))
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false))
    }
  }, [])

  return [play, pause, playing, toggle]
}

export default useAudio
