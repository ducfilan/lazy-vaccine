import React, { useState } from "react"

function Clock(props: { parentProps: React.CSSProperties; textStyle: React.CSSProperties }) {
  const [clockText, setClockText] = useState<string>(new Date().toLocaleTimeString())

  setInterval(() => setClockText(new Date().toLocaleTimeString()), 1000)

  return (
    <div className="lzv-clock" style={props.parentProps}>
      <h1 style={props.textStyle}>{clockText}</h1>
    </div>
  )
}

export default Clock
