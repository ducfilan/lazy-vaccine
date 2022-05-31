import * as React from "react"
import "../css/spotlight-title.scss"

const SpotlightTitle: React.FunctionComponent<any> = () => {
  return (
    <section className="spotlight-title--container">
      <h1 className="title">
        <span>Our Earth</span>
        <span>is in</span>
        <span>danger!</span>
      </h1>

      <h2 className="title">
        <span>To save our planet</span>
        <span>We need</span>
        <span>Supermen</span>
      </h2>

      <h1 className="title-no-animation">
        <span>You can be a</span>
        <span>Superman</span>
      </h1>
    </section>
  )
}

export default SpotlightTitle
