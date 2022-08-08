import { useMemo, useEffect, useState } from "react"

const useAudio = (url: string | undefined): [() => void, () => void, boolean] => {
  const audio = useMemo(() => new Audio(url), [url])
  const [playing, setPlaying] = useState(false)

  const toggle = () => setPlaying(!playing)
  const play = () => audio.play()

  useEffect(() => {
    playing ? audio.play() : audio.pause()
  }, [playing])

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false))
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false))
    }
  }, [])

  return [play, toggle, playing]
}

export default useAudio
