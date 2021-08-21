import * as React from "react"

import { Spin } from "antd"

import shibaGoodMorningIcon from "@img/emojis/shiba/gm.png"

function Loading() {
  return (
    <Spin
      style={{ position: "absolute", width: "100%", bottom: "50vh" }}
      indicator={
        <>
          <img
            src={shibaGoodMorningIcon}
            style={{
              width: "auto",
              height: "auto",
              fontSize: "169px",
            }}
          />
          <br />
          <p>Loading...</p>
        </>
      }
    />
  )
}

export default Loading
