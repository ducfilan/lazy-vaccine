import * as React from "react"
import "@/pages/app/css/congrats-screen.scss"

const CongratsScreen = (props: { innerContent: string | React.ReactElement }) => {
  return (
    <div className="congrats-screen-wrapper">
      <div className="wohoo">
        <span className="txt">{props.innerContent}</span>
      </div>
      {Array.from(Array(302).keys())
        .reverse()
        .map((i) => (
          <div className={`confetti-${i}`}></div>
        ))}
    </div>
  )
}

export default CongratsScreen
