import * as React from "react"

import { Spin } from "antd"

import shibaRunningIcon from "@img/emojis/shiba/running.png"

function Loading() {
  return (
    <Spin
      style={{ position: "absolute", width: "100%", bottom: "50vh" }}
      indicator={
        <>
          <img
            src={shibaRunningIcon}
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
